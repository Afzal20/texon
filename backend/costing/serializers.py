from rest_framework import serializers
from buyers.models import Buyer
from merchandising.models import Style
from .models import PreCosting, CostSheet


class PreCostingSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())
    style = serializers.PrimaryKeyRelatedField(queryset=Style.objects.all())

    class Meta:
        model = PreCosting
        fields = [
            "id", "organization", "buyer", "style", "cost_date",
            "estimated_fabric_cost", "estimated_accessory_cost",
            "estimated_trim_cost", "estimated_labor_cost", "estimated_overhead",
            "total_estimated_cost", "target_price", "expected_margin",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_expected_margin(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Expected margin must be between 0 and 100.")
        return value


class CostSheetSerializer(serializers.ModelSerializer):
    style = serializers.PrimaryKeyRelatedField(queryset=Style.objects.all())

    class Meta:
        model = CostSheet
        fields = [
            "id", "organization", "style", "cost_date",
            "fabric_cost", "accessory_cost", "trim_cost", "labor_cost",
            "overhead_cost", "commercial_cost", "total_cost",
            "selling_price", "margin", "status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_margin(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Margin must be between 0 and 100.")
        return value
