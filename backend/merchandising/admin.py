from django.contrib import admin

from .models import (
    BuyerEnquiry,
    DevelopmentMonitoring,
    PurchaseOrder,
    SMVRecord,
    SampleOrder,
    Style,
)


@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    list_display = ("style_number", "name", "buyer", "organization", "category", "is_active")
    search_fields = ("style_number", "name")
    list_filter = ("is_active", "category")


@admin.register(BuyerEnquiry)
class BuyerEnquiryAdmin(admin.ModelAdmin):
    list_display = ("buyer", "style", "enquiry_date", "status")
    list_filter = ("status",)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_number", "buyer", "style", "order_date", "delivery_date", "quantity", "status")
    search_fields = ("po_number",)
    list_filter = ("status",)


@admin.register(SampleOrder)
class SampleOrderAdmin(admin.ModelAdmin):
    list_display = ("sample_type", "style", "buyer", "request_date", "deadline", "status")
    list_filter = ("sample_type", "status")


@admin.register(SMVRecord)
class SMVRecordAdmin(admin.ModelAdmin):
    list_display = ("style", "smv", "calculated_by", "calculation_date")


@admin.register(DevelopmentMonitoring)
class DevelopmentMonitoringAdmin(admin.ModelAdmin):
    list_display = ("style", "supplier", "stage", "status")
    list_filter = ("status",)
