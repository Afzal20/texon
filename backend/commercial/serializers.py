from rest_framework import serializers
from core.models import Organization, Currency
from buyers.models import Buyer
from procurement.models import Supplier
from orders.models import Order

from .models import (
    Shipment, LetterOfCredit, Invoice, BillOfExchange,
    SupplierDocument, Realization, SODFCTransfer, Disbursement,
)


class ShipmentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.all(), allow_null=True, required=False
    )
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), allow_null=True, required=False
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), allow_null=True, required=False
    )
    buyer_detail = serializers.SerializerMethodField()
    supplier_detail = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            "id", "organization", "shipment_number", "buyer", "supplier",
            "direction", "shipment_type", "port_of_loading", "port_of_discharge",
            "container_number", "container_size", "forwarder", "vessel_name",
            "carrier", "booking_number", "purchase_order", "shipment_date",
            "etd", "eta", "actual_arrival", "gross_weight", "net_weight",
            "volume_cbm", "status", "clearance_status", "notes",
            "buyer_detail", "supplier_detail", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_buyer_detail(self, obj):
        if obj.buyer:
            return {"id": obj.buyer.id, "name": obj.buyer.name, "code": obj.buyer.code}
        return None

    def get_supplier_detail(self, obj):
        if obj.supplier:
            return {"id": obj.supplier.id, "name": obj.supplier.name, "code": obj.supplier.code}
        return None


class LetterOfCreditSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.all(), allow_null=True, required=False
    )
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), allow_null=True, required=False
    )
    parent_lc = serializers.PrimaryKeyRelatedField(
        queryset=LetterOfCredit.objects.all(), allow_null=True, required=False
    )
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )
    buyer_detail = serializers.SerializerMethodField()

    class Meta:
        model = LetterOfCredit
        fields = [
            "id", "organization", "lc_number", "lc_type", "buyer", "supplier",
            "parent_lc", "amount", "currency", "issue_date", "expiry_date",
            "bank_name", "bank_reference", "status", "amendment_count", "notes",
            "buyer_detail", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_buyer_detail(self, obj):
        if obj.buyer:
            return {"id": obj.buyer.id, "name": obj.buyer.name, "code": obj.buyer.code}
        return None


class InvoiceSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.all(), allow_null=True, required=False
    )
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), allow_null=True, required=False
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), allow_null=True, required=False
    )
    lc = serializers.PrimaryKeyRelatedField(
        queryset=LetterOfCredit.objects.all(), allow_null=True, required=False
    )
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )
    buyer_detail = serializers.SerializerMethodField()
    purchase_order_detail = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id", "organization", "invoice_number", "buyer", "supplier",
            "purchase_order", "lc", "invoice_date", "due_date", "amount",
            "currency", "invoice_type", "status", "paid_amount",
            "payment_terms", "notes", "buyer_detail", "purchase_order_detail",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_buyer_detail(self, obj):
        if obj.buyer:
            return {"id": obj.buyer.id, "name": obj.buyer.name, "code": obj.buyer.code}
        return None

    def get_purchase_order_detail(self, obj):
        if obj.purchase_order:
            return {"id": obj.purchase_order.id, "po_no": obj.purchase_order.order_number}
        return None


class BillOfExchangeSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    lc = serializers.PrimaryKeyRelatedField(
        queryset=LetterOfCredit.objects.all(), allow_null=True, required=False
    )
    buyer = serializers.PrimaryKeyRelatedField(
        queryset=Buyer.objects.all(), allow_null=True, required=False
    )
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )
    buyer_detail = serializers.SerializerMethodField()
    lc_detail = serializers.SerializerMethodField()

    class Meta:
        model = BillOfExchange
        fields = [
            "id", "organization", "bill_number", "lc", "buyer",
            "bank_name", "bank_reference", "amount", "currency",
            "issue_date", "maturity_date", "status", "documents_required",
            "notes", "buyer_detail", "lc_detail", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_buyer_detail(self, obj):
        if obj.buyer:
            return {"id": obj.buyer.id, "name": obj.buyer.name, "code": obj.buyer.code}
        return None

    def get_lc_detail(self, obj):
        if obj.lc:
            return {"id": obj.lc.id, "lc_number": obj.lc.lc_number}
        return None


class SupplierDocumentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())
    shipment = serializers.PrimaryKeyRelatedField(
        queryset=Shipment.objects.all(), allow_null=True, required=False
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), allow_null=True, required=False
    )
    supplier_detail = serializers.SerializerMethodField()

    class Meta:
        model = SupplierDocument
        fields = [
            "id", "organization", "document_number", "supplier", "shipment",
            "purchase_order", "document_type", "received_date", "reviewed_by",
            "review_date", "status", "rejection_reason", "notes",
            "supplier_detail", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_supplier_detail(self, obj):
        if obj.supplier:
            return {"id": obj.supplier.id, "name": obj.supplier.name, "code": obj.supplier.code}
        return None


class RealizationSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )
    buyer_detail = serializers.SerializerMethodField()

    class Meta:
        model = Realization
        fields = [
            "id", "organization", "realization_number", "buyer", "invoice",
            "expected_amount", "realized_amount", "currency", "realization_date",
            "due_date", "status", "short_reason", "short_amount", "notes",
            "buyer_detail", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_buyer_detail(self, obj):
        if obj.buyer:
            return {"id": obj.buyer.id, "name": obj.buyer.name, "code": obj.buyer.code}
        return None


class SODFCTransferSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = SODFCTransfer
        fields = [
            "id", "organization", "transfer_number", "transfer_type",
            "bank_name", "bank_reference", "amount", "currency",
            "transfer_date", "acknowledged_by", "acknowledgment_date",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DisbursementSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), allow_null=True, required=False
    )
    invoice = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(), allow_null=True, required=False
    )
    shipment = serializers.PrimaryKeyRelatedField(
        queryset=Shipment.objects.all(), allow_null=True, required=False
    )
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Disbursement
        fields = [
            "id", "organization", "disbursement_number", "category",
            "purchase_order", "invoice", "shipment", "amount", "currency",
            "disbursement_date", "approved_by", "approval_date", "status",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
