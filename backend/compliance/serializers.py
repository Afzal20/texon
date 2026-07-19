from rest_framework import serializers

from buyers.models import Buyer
from core.models import Organization
from .models import ComplianceRecord


class ComplianceRecordSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.select_related("organization").all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = ComplianceRecord
        fields = [
            "id",
            "organization",
            "buyer",
            "compliance_type",
            "title",
            "description",
            "audit_date",
            "audit_by",
            "score",
            "status",
            "findings",
            "corrective_actions",
            "follow_up_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_organization(self, value):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            pass
        return value

    def validate_score(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Score must be between 0 and 100.")
        return value

    def validate_audit_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Audit date cannot be in the future.")
        return value
