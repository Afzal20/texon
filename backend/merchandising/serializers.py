from rest_framework import serializers
from buyers.models import Buyer
from core.models import Organization
from production.models import ProductionLine
from hr.models import Employee
from .models import (
    BudgetDemandAssessment,
    BuyerEnquiry,
    DevelopmentMonitoring,
    IeSuggestion,
    ProcessWiseTarget,
    ProductionDowntime,
    PurchaseOrder,
    SMVRecord,
    SampleOrder,
    SkillInventory,
    Style,
)


class StyleSerializer(serializers.ModelSerializer):
    # PrimaryKeyRelatedField keeps payloads flat — frontend has IDs from context
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.filter(is_active=True),
    )

    class Meta:
        model = Style
        fields = [
            "id",
            "organization",
            "buyer",
            "name",
            "style_number",
            "description",
            "category",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_style_number(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = Style.objects.filter(organization_id=org_id, style_number__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A style with this number already exists in this organization."
                )
        return value


class BuyerEnquirySerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = BuyerEnquiry
        fields = [
            "id",
            "organization",
            "buyer",
            "style",
            "enquiry_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "received": ["under_review"],
                "under_review": ["quoted"],
                "quoted": ["converted", "lost"],
                "converted": [],
                "lost": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value


class PurchaseOrderSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "organization",
            "buyer",
            "style",
            "po_number",
            "order_date",
            "delivery_date",
            "quantity",
            "unit_price",
            "total_value",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_po_number(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = PurchaseOrder.objects.filter(
                organization_id=org_id, po_number__iexact=value
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A purchase order with this number already exists in this organization."
                )
        return value

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "draft": ["confirmed", "cancelled"],
                "confirmed": ["in_production", "cancelled"],
                "in_production": ["shipped", "cancelled"],
                "shipped": ["delivered"],
                "delivered": [],
                "cancelled": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value

    def validate(self, attrs):
        if attrs.get("delivery_date") and attrs.get("order_date"):
            if attrs["delivery_date"] < attrs["order_date"]:
                raise serializers.ValidationError(
                    {"delivery_date": "Delivery date cannot be before order date."}
                )
        return attrs


class SampleOrderSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = SampleOrder
        fields = [
            "id",
            "organization",
            "buyer",
            "style",
            "sample_type",
            "quantity",
            "request_date",
            "deadline",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "requested": ["in_progress"],
                "in_progress": ["submitted"],
                "submitted": ["approved", "rejected"],
                "approved": [],
                "rejected": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value

    def validate(self, attrs):
        if attrs.get("deadline") and attrs.get("request_date"):
            if attrs["deadline"] < attrs["request_date"]:
                raise serializers.ValidationError(
                    {"deadline": "Deadline cannot be before request date."}
                )
        return attrs


class SMVRecordSerializer(serializers.ModelSerializer):
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = SMVRecord
        fields = [
            "id",
            "style",
            "smv",
            "calculated_by",
            "calculation_date",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class DevelopmentMonitoringSerializer(serializers.ModelSerializer):
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = DevelopmentMonitoring
        fields = [
            "id",
            "style",
            "supplier",
            "stage",
            "start_date",
            "completion_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "pending": ["in_progress"],
                "in_progress": ["completed"],
                "completed": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value

    def validate(self, attrs):
        if attrs.get("completion_date") and attrs.get("start_date"):
            if attrs["completion_date"] < attrs["start_date"]:
                raise serializers.ValidationError(
                    {"completion_date": "Completion date cannot be before start date."}
                )
        return attrs



class BudgetDemandAssessmentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.filter(is_active=True),
    )

    class Meta:
        model = BudgetDemandAssessment
        fields = [
            "id", "organization", "buyer", "assessment_date",
            "forecast_quantity", "booked_quantity", "gap_quantity",
            "revenue_estimate", "confidence", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "gap_quantity", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs["gap_quantity"] = max(0, attrs.get("forecast_quantity", 0) - attrs.get("booked_quantity", 0))
        return attrs


class IeSuggestionSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.all(), allow_null=True, required=False,
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True), allow_null=True, required=False,
    )

    class Meta:
        model = IeSuggestion
        fields = [
            "id", "organization", "production_line", "style", "operation",
            "current_pph", "target_pph", "description", "status",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SkillInventorySerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    employee = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), allow_null=True, required=False,
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = SkillInventory
        fields = [
            "id", "organization", "employee", "operator_name", "production_line",
            "skill_name", "skill_level", "multi_skill", "last_assessed", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProductionDowntimeSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    production_line = serializers.PrimaryKeyRelatedField(
        queryset=ProductionLine.objects.all(), allow_null=True, required=False,
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True), allow_null=True, required=False,
    )

    class Meta:
        model = ProductionDowntime
        fields = [
            "id", "organization", "production_line", "style",
            "start_datetime", "duration_hours", "cause", "description", "status",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProcessWiseTargetSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = ProcessWiseTarget
        fields = [
            "id", "organization", "process_name", "target_quantity",
            "achieved_quantity", "variance", "target_date", "status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "variance", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs["variance"] = attrs.get("achieved_quantity", 0) - attrs.get("target_quantity", 0)
        return attrs
