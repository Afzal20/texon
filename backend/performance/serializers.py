from rest_framework import serializers

from core.models import Organization
from merchandising.models import Style
from production.models import ProductionLine
from .models import PerformanceRecord


class PerformanceRecordSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.select_related("organization").all(),
        allow_null=True,
        required=False,
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.select_related("organization").all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = PerformanceRecord
        fields = [
            "id",
            "organization",
            "style",
            "production_line",
            "record_date",
            "metric",
            "value",
            "target",
            "unit",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_organization(self, value):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            pass
        return value

    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Value must be non-negative.")
        return value

    def validate_target(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Target must be non-negative.")
        return value
