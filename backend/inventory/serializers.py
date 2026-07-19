from rest_framework import serializers

from core.models import Organization
from .models import Accessory, Fabric, PhysicalInventory, ShadeApproval, StockMovement, Trim, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = Warehouse
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "location",
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
            qs = Warehouse.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A warehouse with this code already exists in this organization."
                )
        return value


class FabricSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = Fabric
        fields = [
            "id",
            "organization",
            "warehouse",
            "name",
            "code",
            "color",
            "composition",
            "width",
            "quantity",
            "unit",
            "threshold_quantity",
            "unit_price",
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
            qs = Fabric.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A fabric with this code already exists in this organization."
                )
        return value


class AccessorySerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = Accessory
        fields = [
            "id",
            "organization",
            "warehouse",
            "name",
            "code",
            "category",
            "quantity",
            "unit",
            "threshold_quantity",
            "unit_price",
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
            qs = Accessory.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "An accessory with this code already exists in this organization."
                )
        return value


class TrimSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = Trim
        fields = [
            "id",
            "organization",
            "warehouse",
            "name",
            "code",
            "quantity",
            "unit",
            "threshold_quantity",
            "unit_price",
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
            qs = Trim.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A trim with this code already exists in this organization."
                )
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    from_warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), allow_null=True, required=False,
    )
    to_warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), allow_null=True, required=False,
    )

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "organization",
            "item_type",
            "item_id",
            "from_warehouse",
            "to_warehouse",
            "movement_type",
            "quantity",
            "reference_number",
            "notes",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value

    def validate(self, attrs):
        movement_type = attrs.get("movement_type")
        from_wh = attrs.get("from_warehouse")
        to_wh = attrs.get("to_warehouse")

        if movement_type == "transfer" and from_wh and to_wh and from_wh == to_wh:
            raise serializers.ValidationError(
                "From and to warehouse must be different for a transfer."
            )
        return attrs


class ShadeApprovalSerializer(serializers.ModelSerializer):
    fabric = serializers.PrimaryKeyRelatedField(
        queryset=Fabric.objects.all(),
    )

    class Meta:
        model = ShadeApproval
        fields = [
            "id",
            "fabric",
            "shade_name",
            "shade_code",
            "approved_by",
            "approval_date",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class PhysicalInventorySerializer(serializers.ModelSerializer):
    warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(),
    )

    class Meta:
        model = PhysicalInventory
        fields = [
            "id",
            "warehouse",
            "inventory_date",
            "status",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
