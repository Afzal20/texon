from rest_framework import serializers
from core.models import Organization
from merchandising.models import PurchaseOrder, Style
from .models import (
    CuttingRecord,
    FloorRequisition,
    InspectionPacking,
    ProductionLine,
    ProductionOrder,
    SewingRecord,
)


class ProductionLineSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = ProductionLine
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "location",
            "capacity",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_code(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = ProductionLine.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A production line with this code already exists in this organization."
                )
        return value


class ProductionOrderSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.filter(is_active=True),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = ProductionOrder
        fields = [
            "id",
            "organization",
            "purchase_order",
            "style",
            "production_line",
            "order_number",
            "quantity",
            "start_date",
            "end_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_order_number(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = ProductionOrder.objects.filter(
                organization_id=org_id, order_number__iexact=value
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A production order with this number already exists in this organization."
                )
        return value

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "pending": ["released"],
                "released": ["in_progress", "cancelled"],
                "in_progress": ["completed", "on_hold"],
                "completed": [],
                "on_hold": ["in_progress", "cancelled"],
                "cancelled": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value

    def validate(self, attrs):
        if attrs.get("end_date") and attrs.get("start_date"):
            if attrs["end_date"] < attrs["start_date"]:
                raise serializers.ValidationError(
                    {"end_date": "End date cannot be before start date."}
                )
        return attrs


class CuttingRecordSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )

    class Meta:
        model = CuttingRecord
        fields = [
            "id",
            "production_order",
            "date",
            "quantity_cut",
            "fabric_used",
            "waste_quantity",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SewingRecordSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.filter(is_active=True),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = SewingRecord
        fields = [
            "id",
            "production_order",
            "production_line",
            "date",
            "input_quantity",
            "output_quantity",
            "defect_quantity",
            "efficiency",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class InspectionPackingSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )

    class Meta:
        model = InspectionPacking
        fields = [
            "id",
            "production_order",
            "date",
            "inspected_quantity",
            "passed_quantity",
            "failed_quantity",
            "packed_quantity",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class FloorRequisitionSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )

    class Meta:
        model = FloorRequisition
        fields = [
            "id",
            "production_order",
            "item_type",
            "quantity_requested",
            "quantity_approved",
            "request_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "pending": ["approved", "rejected"],
                "approved": ["issued"],
                "rejected": [],
                "issued": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value
