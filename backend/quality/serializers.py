from rest_framework import serializers

from core.models import Organization
from production.models import ProductionOrder

from .models import DefectCategory, EndLineQC, FabricInspection, FinalInspection, InlineQC, RejectionReport


class DefectCategorySerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = DefectCategory
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "description",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate_code(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = DefectCategory.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A defect category with this code already exists in this organization."
                )
        return value


class FabricInspectionSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    defect_category = serializers.PrimaryKeyRelatedField(
        queryset=DefectCategory.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = FabricInspection
        fields = [
            "id",
            "organization",
            "fabric_received_from",
            "supplier",
            "inspection_date",
            "total_quantity",
            "inspected_quantity",
            "passed_quantity",
            "rejected_quantity",
            "defect_category",
            "status",
            "notes",
            "inspected_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        total = attrs.get("total_quantity")
        inspected = attrs.get("inspected_quantity")
        if total is not None and inspected is not None and inspected > total:
            raise serializers.ValidationError(
                "Inspected quantity cannot exceed total quantity."
            )
        return attrs


class InlineQCSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )
    defect_category = serializers.PrimaryKeyRelatedField(
        queryset=DefectCategory.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = InlineQC
        fields = [
            "id",
            "production_order",
            "production_line",
            "check_date",
            "checked_quantity",
            "defect_quantity",
            "defect_category",
            "defect_description",
            "action_taken",
            "status",
            "checked_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        checked = attrs.get("checked_quantity")
        defect = attrs.get("defect_quantity")
        if checked is not None and defect is not None and defect > checked:
            raise serializers.ValidationError(
                "Defect quantity cannot exceed checked quantity."
            )
        return attrs


class EndLineQCSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )
    defect_category = serializers.PrimaryKeyRelatedField(
        queryset=DefectCategory.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = EndLineQC
        fields = [
            "id",
            "production_order",
            "check_date",
            "checked_quantity",
            "passed_quantity",
            "failed_quantity",
            "defect_category",
            "remarks",
            "status",
            "checked_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        checked = attrs.get("checked_quantity")
        failed = attrs.get("failed_quantity")
        if checked is not None and failed is not None and failed > checked:
            raise serializers.ValidationError(
                "Failed quantity cannot exceed checked quantity."
            )
        return attrs


class RejectionReportSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )
    defect_category = serializers.PrimaryKeyRelatedField(
        queryset=DefectCategory.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = RejectionReport
        fields = [
            "id",
            "production_order",
            "report_date",
            "stage",
            "rejected_quantity",
            "defect_category",
            "defect_details",
            "corrective_action",
            "reported_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class FinalInspectionSerializer(serializers.ModelSerializer):
    production_order = serializers.PrimaryKeyRelatedField(
        queryset=ProductionOrder.objects.all(),
    )

    class Meta:
        model = FinalInspection
        fields = [
            "id",
            "production_order",
            "inspection_date",
            "inspected_quantity",
            "passed_quantity",
            "failed_quantity",
            "aql_level",
            "critical_defects",
            "major_defects",
            "minor_defects",
            "status",
            "notes",
            "inspected_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        inspected = attrs.get("inspected_quantity")
        failed = attrs.get("failed_quantity")
        if inspected is not None and failed is not None and failed > inspected:
            raise serializers.ValidationError(
                "Failed quantity cannot exceed inspected quantity."
            )
        return attrs
