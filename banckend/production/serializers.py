from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    HeatmapData,
    LineCapacity,
    OEELog,
    ProductionLine,
    ProductionRecord,
    ProductionShift,
    ProductionUnit,
)


# ──────────────────────────────────────────────
# Leaf / shared serializers
# ──────────────────────────────────────────────


class LineCapacitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LineCapacity
        fields = ["id", "daily_capacity_pcs", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class ProductionShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionShift
        fields = ["id", "name", "start_time", "end_time", "organization"]
        read_only_fields = ["id", "organization"]


# ──────────────────────────────────────────────
# ProductionLine
# ──────────────────────────────────────────────


class ProductionLineSerializer(serializers.ModelSerializer):
    capacity = LineCapacitySerializer(read_only=True)

    class Meta:
        model = ProductionLine
        fields = ["id", "name", "is_active", "production_unit", "capacity"]
        read_only_fields = ["id"]


# ──────────────────────────────────────────────
# ProductionUnit — list vs detail
# ──────────────────────────────────────────────


class ProductionUnitListSerializer(serializers.ModelSerializer):
    lines_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductionUnit
        fields = ["id", "name", "location", "organization", "lines_count"]
        read_only_fields = ["id", "organization"]


class ProductionUnitDetailSerializer(serializers.ModelSerializer):
    lines = ProductionLineSerializer(many=True, read_only=True)

    class Meta:
        model = ProductionUnit
        fields = ["id", "name", "location", "organization", "lines"]
        read_only_fields = ["id", "organization"]


# ──────────────────────────────────────────────
# ProductionRecord — list vs detail
# ──────────────────────────────────────────────


class ProductionRecordListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionRecord
        fields = [
            "id",
            "production_line",
            "shift",
            "output_pcs",
            "timestamp",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ProductionRecordDetailSerializer(serializers.ModelSerializer):
    efficiency_rate = serializers.SerializerMethodField()
    shift_duration = serializers.SerializerMethodField()

    class Meta:
        model = ProductionRecord
        fields = [
            "id",
            "production_line",
            "shift",
            "output_pcs",
            "timestamp",
            "created_at",
            "efficiency_rate",
            "shift_duration",
        ]
        read_only_fields = ["id", "created_at"]

    # ------------------------------------------------------------------
    def get_efficiency_rate(self, obj) -> float | None:
        """
        ``(output_pcs / daily_capacity_pcs) * 100``.
        Returns *None* when LineCapacity is not configured.
        """
        try:
            capacity = obj.production_line.capacity.daily_capacity_pcs
        except (LineCapacity.DoesNotExist, AttributeError):
            return None

        if capacity and capacity > 0:
            return round((obj.output_pcs / capacity) * 100, 2)
        return None

    def get_shift_duration(self, obj) -> float | None:
        """
        Hours between ``shift.start_time`` and ``shift.end_time``.
        Handles overnight shifts (end < start) automatically.
        """
        shift = obj.shift
        if shift is None:
            return None

        start = shift.start_time
        end = shift.end_time

        # Combine with an arbitrary date so we can subtract
        today = datetime.today().date()
        dt_start = datetime.combine(today, start)
        dt_end = datetime.combine(today, end)

        diff: timedelta = dt_end - dt_start
        if diff.total_seconds() < 0:
            # Overnight shift — add 24 h
            diff += timedelta(days=1)

        return round(diff.total_seconds() / 3600, 2)

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------
    def validate_output_pcs(self, value):
        if value < 0:
            raise serializers.ValidationError("output_pcs cannot be negative.")
        return value


# ──────────────────────────────────────────────
# OEELog
# ──────────────────────────────────────────────


class OEELogSerializer(serializers.ModelSerializer):
    oee_score = serializers.SerializerMethodField()

    class Meta:
        model = OEELog
        fields = [
            "id",
            "production_line",
            "availability_rate",
            "performance_rate",
            "quality_rate",
            "oee_score",
            "timestamp",
        ]
        read_only_fields = ["id"]

    def get_oee_score(self, obj) -> float:
        """``availability_rate * performance_rate * quality_rate / 10000``."""
        from decimal import Decimal
        a = Decimal(str(obj.availability_rate or 0))
        p = Decimal(str(obj.performance_rate or 0))
        q = Decimal(str(obj.quality_rate or 0))
        return float(round(a * p * q / 10_000, 2))

    # ------------------------------------------------------------------
    def _validate_rate(self, value, field_name):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                f"{field_name} must be between 0 and 100."
            )
        return value

    def validate_availability_rate(self, value):
        return self._validate_rate(value, "availability_rate")

    def validate_performance_rate(self, value):
        return self._validate_rate(value, "performance_rate")

    def validate_quality_rate(self, value):
        return self._validate_rate(value, "quality_rate")


# ──────────────────────────────────────────────
# DowntimeEvent
# ──────────────────────────────────────────────


class DowntimeEventSerializer(serializers.ModelSerializer):
    downtime_hours = serializers.SerializerMethodField()

    class Meta:
        model = DowntimeEvent
        fields = [
            "id",
            "production_line",
            "reason",
            "duration_minutes",
            "started_at",
            "resolved_at",
            "downtime_hours",
        ]
        read_only_fields = ["id"]

    def get_downtime_hours(self, obj) -> float:
        return round(obj.duration_minutes / 60, 2)

    def validate(self, attrs):
        """``resolved_at`` must be after ``started_at``."""
        started = attrs.get("started_at") or getattr(self.instance, "started_at", None)
        resolved = attrs.get("resolved_at")

        if resolved and started and resolved <= started:
            raise serializers.ValidationError(
                {"resolved_at": "resolved_at must be after started_at."}
            )
        return attrs


# ──────────────────────────────────────────────
# DefectLog
# ──────────────────────────────────────────────


class DefectLogSerializer(serializers.ModelSerializer):
    dhu = serializers.SerializerMethodField()

    class Meta:
        model = DefectLog
        fields = [
            "id",
            "production_line",
            "defect_type",
            "quantity",
            "checked_units",
            "timestamp",
            "dhu",
        ]
        read_only_fields = ["id"]

    def get_dhu(self, obj) -> float:
        """Defects per hundred units."""
        if obj.checked_units and obj.checked_units > 0:
            return round((obj.quantity / obj.checked_units) * 100, 2)
        return 0.0

    def validate_checked_units(self, value):
        if value <= 0:
            raise serializers.ValidationError("checked_units must be greater than 0.")
        return value


# ──────────────────────────────────────────────
# HeatmapData
# ──────────────────────────────────────────────


class HeatmapDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeatmapData
        fields = ["id", "production_line", "activity_score", "timestamp"]
        read_only_fields = ["id"]


# ──────────────────────────────────────────────
# BottleneckAlert
# ──────────────────────────────────────────────


class BottleneckAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = BottleneckAlert
        fields = [
            "id",
            "production_line",
            "alert_message",
            "is_resolved",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = ["id", "created_at"]


# ──────────────────────────────────────────────
# Bulk import serializer
# ──────────────────────────────────────────────


class BulkProductionRecordSerializer(serializers.Serializer):
    """
    Accepts ``{"records": [{...}, ...]}`` for batch import of
    production records.
    """

    records = ProductionRecordDetailSerializer(many=True)

    def create(self, validated_data):
        records_data = validated_data["records"]
        instances = [ProductionRecord(**item) for item in records_data]
        return ProductionRecord.objects.bulk_create(instances)

    def validate_records(self, value):
        if not value:
            raise serializers.ValidationError(
                "At least one record must be provided."
            )
        return value


# ──────────────────────────────────────────────
# Inline serializers for custom action payloads
# ──────────────────────────────────────────────


class RecordOutputSerializer(serializers.Serializer):
    shift_id = serializers.IntegerField()
    output_pcs = serializers.IntegerField(min_value=0)
    timestamp = serializers.DateTimeField(default=timezone.now)

    def validate_output_pcs(self, value):
        if value < 0:
            raise serializers.ValidationError("output_pcs cannot be negative.")
        return value


class RecordOEESerializer(serializers.Serializer):
    availability_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=100
    )
    performance_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=100
    )
    quality_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=100
    )
    timestamp = serializers.DateTimeField(default=timezone.now)


class ReportDowntimeSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=255)
    duration_minutes = serializers.IntegerField(min_value=1)
    started_at = serializers.DateTimeField()


class ReportDefectSerializer(serializers.Serializer):
    defect_type = serializers.CharField(max_length=100)
    quantity = serializers.IntegerField(min_value=1)
    checked_units = serializers.IntegerField(min_value=1)


class ResolveBottleneckSerializer(serializers.Serializer):
    resolved_at = serializers.DateTimeField(default=timezone.now)
