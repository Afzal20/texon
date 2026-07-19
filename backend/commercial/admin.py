from django.contrib import admin

from .models import BillOfExchange, Invoice, LC, Shipment


@admin.register(LC)
class LCAdmin(admin.ModelAdmin):
    list_display = ("lc_number", "lc_type", "buyer", "issue_date", "expiry_date", "amount", "status")
    search_fields = ("lc_number",)
    list_filter = ("lc_type", "status")


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ("shipment_number", "buyer", "shipment_date", "container_number", "quantity", "status")
    search_fields = ("shipment_number", "container_number")
    list_filter = ("status",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "buyer", "invoice_date", "amount", "status")
    search_fields = ("invoice_number",)
    list_filter = ("status",)


@admin.register(BillOfExchange)
class BillOfExchangeAdmin(admin.ModelAdmin):
    list_display = ("bill_number", "buyer", "issue_date", "due_date", "amount", "status")
    list_filter = ("status",)
