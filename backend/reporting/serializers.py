from rest_framework import serializers

from core.models import Organization
from .models import Dashboard, Report


class ReportSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "organization",
            "title",
            "report_type",
            "parameters",
            "generated_by",
            "generated_at",
            "file",
            "status",
            "notes",
        ]
        read_only_fields = ["id", "generated_at"]

    def validate_organization(self, value):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            pass
        return value


class DashboardSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = Dashboard
        fields = [
            "id",
            "organization",
            "name",
            "dashboard_type",
            "config",
            "is_default",
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
