from rest_framework import serializers
from core.models import Organization
from merchandising.models import PurchaseOrder, Style
from .models import (
    CapacityBooking,
    LinePlan,
    ProductionPlan,
    RiskAssessment,
    StyleAnalysis,
)


class CapacityBookingSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = CapacityBooking
        fields = [
            "id",
            "organization",
            "style",
            "line",
            "capacity_per_day",
            "booking_date",
            "allocated_days",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "allocated": ["in_use", "released"],
                "in_use": ["released"],
                "released": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value


class LinePlanSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = LinePlan
        fields = [
            "id",
            "organization",
            "style",
            "line",
            "plan_date",
            "target_quantity",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "planned": ["running"],
                "running": ["completed"],
                "completed": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value


class ProductionPlanSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = ProductionPlan
        fields = [
            "id",
            "organization",
            "purchase_order",
            "style",
            "planned_start_date",
            "planned_end_date",
            "daily_target",
            "total_quantity",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "draft": ["approved"],
                "approved": ["in_progress", "on_hold"],
                "in_progress": ["completed", "on_hold"],
                "completed": [],
                "on_hold": ["in_progress"],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value

    def validate(self, attrs):
        if attrs.get("planned_end_date") and attrs.get("planned_start_date"):
            if attrs["planned_end_date"] < attrs["planned_start_date"]:
                raise serializers.ValidationError(
                    {"planned_end_date": "End date cannot be before start date."}
                )
        return attrs


class RiskAssessmentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = RiskAssessment
        fields = [
            "id",
            "organization",
            "style",
            "risk_type",
            "severity",
            "likelihood",
            "mitigation_plan",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance:
            valid_transitions = {
                "open": ["mitigated"],
                "mitigated": ["closed"],
                "closed": [],
            }
            if value not in valid_transitions.get(self.instance.status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{self.instance.status}' to '{value}'."
                )
        return value


class StyleAnalysisSerializer(serializers.ModelSerializer):
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.filter(is_active=True),
    )

    class Meta:
        model = StyleAnalysis
        fields = [
            "id",
            "style",
            "analysis_type",
            "findings",
            "recommendation",
            "analyzed_by",
            "analysis_date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
