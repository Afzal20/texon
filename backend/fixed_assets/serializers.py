from rest_framework import serializers

from core.models import Location, Organization

from .models import AssetCategory, DepreciationSchedule, FixedAsset


class AssetCategorySerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = AssetCategory
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "description",
            "depreciation_method",
            "useful_life_years",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate_code(self, value):
        org_id = self._get_org_id()
        if org_id:
            qs = AssetCategory.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "An asset category with this code already exists in this organization.",
                )
        return value

    def _get_org_id(self):
        if self.instance:
            return self.instance.organization_id
        return self.initial_data.get("organization")


class FixedAssetSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )
    category = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=AssetCategory.objects.all(),
    )
    location = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Location.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = FixedAsset
        fields = [
            "id",
            "organization",
            "category",
            "location",
            "asset_code",
            "name",
            "description",
            "purchase_date",
            "purchase_cost",
            "current_value",
            "salvage_value",
            "depreciation_amount",
            "status",
            "assigned_to",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_asset_code(self, value):
        org_id = self._get_org_id()
        if org_id:
            qs = FixedAsset.objects.filter(organization_id=org_id, asset_code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "An asset with this code already exists in this organization.",
                )
        return value

    def _get_org_id(self):
        if self.instance:
            return self.instance.organization_id
        return self.initial_data.get("organization")


class DepreciationScheduleSerializer(serializers.ModelSerializer):
    fixed_asset = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=FixedAsset.objects.all(),
    )

    class Meta:
        model = DepreciationSchedule
        fields = [
            "id",
            "fixed_asset",
            "year",
            "period",
            "opening_value",
            "depreciation",
            "closing_value",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
