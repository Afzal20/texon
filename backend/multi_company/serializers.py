from rest_framework import serializers
from core.models import Currency, Location
from .models import GroupCompany, MultiCompany, LocationBasedOperation


class GroupCompanySerializer(serializers.ModelSerializer):
    base_currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = GroupCompany
        fields = [
            "id", "organization", "name", "code", "registration_number",
            "tax_id", "address", "country", "base_currency", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class MultiCompanySerializer(serializers.ModelSerializer):
    parent_company = serializers.PrimaryKeyRelatedField(queryset=GroupCompany.objects.all())
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = MultiCompany
        fields = [
            "id", "parent_company", "name", "code", "address",
            "country", "currency", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class LocationBasedOperationSerializer(serializers.ModelSerializer):
    multi_company = serializers.PrimaryKeyRelatedField(queryset=MultiCompany.objects.all())
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())

    class Meta:
        model = LocationBasedOperation
        fields = [
            "id", "multi_company", "location", "operation_type",
            "is_active", "created_at",
        ]
        read_only_fields = ["created_at"]
