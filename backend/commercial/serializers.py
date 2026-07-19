from rest_framework import serializers
from core.models import Organization, Currency
from buyers.models import Buyer
from merchandising.models import PurchaseOrder

from .models import LC, Shipment, Invoice, BillOfExchange


class LCSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())  # FK -> Buyer
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(), allow_null=True, required=False
    )  # FK -> PurchaseOrder
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )  # FK -> Currency

    class Meta:
        model = LC
        fields = [
            "id", "organization", "buyer", "purchase_order",
            "lc_number", "lc_type", "issue_date", "expiry_date",
            "amount", "currency", "issuing_bank", "status",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("issue_date") and attrs.get("expiry_date"):
            if attrs["issue_date"] > attrs["expiry_date"]:
                raise serializers.ValidationError(
                    "Expiry date must be on or after issue date."
                )
        return attrs


class ShipmentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all()
    )  # FK -> PurchaseOrder
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())  # FK -> Buyer

    class Meta:
        model = Shipment
        fields = [
            "id", "organization", "purchase_order", "buyer",
            "shipment_number", "shipment_date", "etd", "eta",
            "port_of_loading", "port_of_discharge", "forwarder",
            "container_number", "quantity", "gross_weight",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value

    def validate(self, attrs):
        if attrs.get("etd") and attrs.get("eta") and attrs["etd"] > attrs["eta"]:
            raise serializers.ValidationError(
                "ETD must be on or before ETA."
            )
        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all()
    )  # FK -> PurchaseOrder
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())  # FK -> Buyer
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )  # FK -> Currency

    class Meta:
        model = Invoice
        fields = [
            "id", "organization", "purchase_order", "buyer",
            "invoice_number", "invoice_date", "amount", "currency",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value


class BillOfExchangeSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())  # FK -> Buyer
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )  # FK -> Currency

    class Meta:
        model = BillOfExchange
        fields = [
            "id", "organization", "buyer", "bill_number",
            "issue_date", "due_date", "amount", "currency",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value

    def validate(self, attrs):
        if attrs.get("issue_date") and attrs.get("due_date"):
            if attrs["issue_date"] > attrs["due_date"]:
                raise serializers.ValidationError(
                    "Due date must be on or after issue date."
                )
        return attrs
