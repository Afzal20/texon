from rest_framework import serializers

from core.models import Organization
from merchandising.models import PurchaseOrder, Style
from .models import Plan


class PlanSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.select_related("organization").all(),
        allow_null=True,
        required=False,
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.select_related("organization").all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Plan
        fields = [
            "id",
            "organization",
            "style",
            "purchase_order",
            "plan_type",
            "title",
            "start_date",
            "end_date",
            "details",
            "status",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_organization(self, value):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            pass
        return value

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )
        return attrs
