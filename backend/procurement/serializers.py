from rest_framework import serializers

from core.models import Organization
from .models import QuotationAnalysis, RawMaterialBooking, RawMaterialRequisition, Supplier


class SupplierSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = Supplier
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "contact_person",
            "email",
            "phone",
            "address",
            "supplier_type",
            "rating",
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
            qs = Supplier.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A supplier with this code already exists in this organization."
                )
        return value

    def validate_rating(self, value):
        if value is not None and (value < 0 or value > 5):
            raise serializers.ValidationError("Rating must be between 0 and 5.")
        return value


class RawMaterialRequisitionSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = RawMaterialRequisition
        fields = [
            "id",
            "organization",
            "requisition_number",
            "item_type",
            "item_id",
            "quantity",
            "required_date",
            "purpose",
            "status",
            "requested_by",
            "approved_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_requisition_number(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = RawMaterialRequisition.objects.filter(
                organization_id=org_id, requisition_number__iexact=value
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A requisition with this number already exists in this organization."
                )
        return value

    def validate_required_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Required date cannot be in the past.")
        return value


class RawMaterialBookingSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
    )

    class Meta:
        model = RawMaterialBooking
        fields = [
            "id",
            "organization",
            "supplier",
            "booking_number",
            "booking_date",
            "expected_delivery_date",
            "item_type",
            "item_id",
            "quantity",
            "unit_price",
            "total_value",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_booking_number(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = RawMaterialBooking.objects.filter(
                organization_id=org_id, booking_number__iexact=value
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A booking with this number already exists in this organization."
                )
        return value

    def validate(self, attrs):
        if attrs.get("expected_delivery_date") and attrs.get("booking_date"):
            if attrs["expected_delivery_date"] < attrs["booking_date"]:
                raise serializers.ValidationError(
                    "Expected delivery date must be after the booking date."
                )
        return attrs


class QuotationAnalysisSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
    )

    class Meta:
        model = QuotationAnalysis
        fields = [
            "id",
            "organization",
            "supplier",
            "item_type",
            "quantity",
            "quoted_price",
            "delivery_terms",
            "payment_terms",
            "validity_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_validity_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Validity date cannot be in the past.")
        return value
