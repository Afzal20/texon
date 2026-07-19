from rest_framework import serializers

from core.models import Organization
from production.models import ProductionLine, ProductionOrder
from .models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.select_related("organization").all(),
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.select_related("organization").all(),
    )

    class Meta:
        model = Schedule
        fields = [
            "id",
            "organization",
            "production_order",
            "production_line",
            "scheduled_date",
            "start_time",
            "end_time",
            "target_quantity",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_organization(self, value):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            pass
        return value

    def validate_target_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target quantity must be greater than zero.")
        return value

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time."}
            )
        return attrs
