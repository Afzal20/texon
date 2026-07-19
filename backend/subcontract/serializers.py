from rest_framework import serializers
from core.models import Organization
from merchandising.models import Style, PurchaseOrder

from .models import SubcontractOrder, SubcontractTracking


class SubcontractOrderSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    style = serializers.PrimaryKeyRelatedField(queryset=Style.objects.all())  # FK -> Style
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(), allow_null=True, required=False
    )  # FK -> PurchaseOrder

    class Meta:
        model = SubcontractOrder
        fields = [
            "id", "organization", "style", "purchase_order",
            "order_number", "subcontractor_name", "process",
            "quantity", "rate", "total_value",
            "start_date", "expected_completion", "actual_completion",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive integer.")
        return value

    def validate_rate(self, value):
        if value <= 0:
            raise serializers.ValidationError("Rate must be positive.")
        return value

    def validate(self, attrs):
        if attrs.get("start_date") and attrs.get("expected_completion"):
            if attrs["start_date"] > attrs["expected_completion"]:
                raise serializers.ValidationError(
                    "Expected completion must be on or after start date."
                )
        actual = attrs.get("actual_completion")
        if actual and attrs.get("start_date") and actual < attrs["start_date"]:
            raise serializers.ValidationError(
                "Actual completion cannot be before start date."
            )
        return attrs


class SubcontractTrackingSerializer(serializers.ModelSerializer):
    subcontract_order = serializers.PrimaryKeyRelatedField(
        queryset=SubcontractOrder.objects.all()
    )  # FK -> SubcontractOrder

    class Meta:
        model = SubcontractTracking
        fields = [
            "id", "subcontract_order", "tracking_date",
            "quantity_received", "quantity_passed", "quantity_rejected",
            "status", "remarks", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        received = attrs.get("quantity_received", 0)
        passed = attrs.get("quantity_passed", 0)
        rejected = attrs.get("quantity_rejected", 0)
        if passed + rejected != received:
            raise serializers.ValidationError(
                "Quantity passed plus quantity rejected must equal quantity received."
            )
        return attrs
