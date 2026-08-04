from django.contrib import admin
from .models import (
    Shipment, LetterOfCredit, Invoice, BillOfExchange,
    SupplierDocument, Realization, SODFCTransfer, Disbursement,
)


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ["shipment_number", "direction", "status", "shipment_date", "eta", "created_at"]
    list_filter = ["direction", "shipment_type", "status", "clearance_status"]
    search_fields = ["shipment_number", "container_number", "forwarder"]


@admin.register(LetterOfCredit)
class LetterOfCreditAdmin(admin.ModelAdmin):
    list_display = ["lc_number", "lc_type", "amount", "issue_date", "expiry_date", "status"]
    list_filter = ["lc_type", "status"]
    search_fields = ["lc_number", "bank_name"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "invoice_type", "amount", "invoice_date", "status"]
    list_filter = ["invoice_type", "status"]
    search_fields = ["invoice_number"]


@admin.register(BillOfExchange)
class BillOfExchangeAdmin(admin.ModelAdmin):
    list_display = ["bill_number", "amount", "issue_date", "maturity_date", "status"]
    list_filter = ["status"]
    search_fields = ["bill_number", "bank_name"]


@admin.register(SupplierDocument)
class SupplierDocumentAdmin(admin.ModelAdmin):
    list_display = ["document_number", "supplier", "document_type", "received_date", "status"]
    list_filter = ["document_type", "status"]
    search_fields = ["document_number"]


@admin.register(Realization)
class RealizationAdmin(admin.ModelAdmin):
    list_display = ["realization_number", "buyer", "expected_amount", "realized_amount", "status"]
    list_filter = ["status", "short_reason"]
    search_fields = ["realization_number"]


@admin.register(SODFCTransfer)
class SODFCTransferAdmin(admin.ModelAdmin):
    list_display = ["transfer_number", "transfer_type", "amount", "transfer_date", "status"]
    list_filter = ["transfer_type", "status"]
    search_fields = ["transfer_number", "bank_name"]


@admin.register(Disbursement)
class DisbursementAdmin(admin.ModelAdmin):
    list_display = ["disbursement_number", "category", "amount", "disbursement_date", "status"]
    list_filter = ["category", "status"]
    search_fields = ["disbursement_number"]
