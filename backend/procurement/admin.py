from django.contrib import admin

from .models import (
    QuotationAnalysis,
    RawMaterialBooking,
    RawMaterialRequisition,
    Supplier,
)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "supplier_type", "rating", "is_active")
    search_fields = ("name", "code")
    list_filter = ("supplier_type", "is_active")


@admin.register(RawMaterialRequisition)
class RawMaterialRequisitionAdmin(admin.ModelAdmin):
    list_display = ("requisition_number", "item_type", "quantity", "required_date", "status")
    list_filter = ("status", "item_type")


@admin.register(RawMaterialBooking)
class RawMaterialBookingAdmin(admin.ModelAdmin):
    list_display = ("booking_number", "supplier", "booking_date", "expected_delivery_date", "item_type", "status")
    list_filter = ("status", "item_type")


@admin.register(QuotationAnalysis)
class QuotationAnalysisAdmin(admin.ModelAdmin):
    list_display = ("supplier", "item_type", "quoted_price", "validity_date", "status")
    list_filter = ("status",)
