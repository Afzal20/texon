from django.contrib import admin

from .models import (
    CuttingRecord,
    FloorRequisition,
    InspectionPacking,
    ProductionLine,
    ProductionOrder,
    SewingRecord,
)


@admin.register(ProductionLine)
class ProductionLineAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "capacity", "is_active")
    search_fields = ("name", "code")


@admin.register(ProductionOrder)
class ProductionOrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "style", "production_line", "quantity", "start_date", "status")
    search_fields = ("order_number",)
    list_filter = ("status",)


@admin.register(CuttingRecord)
class CuttingRecordAdmin(admin.ModelAdmin):
    list_display = ("production_order", "date", "quantity_cut", "fabric_used")


@admin.register(SewingRecord)
class SewingRecordAdmin(admin.ModelAdmin):
    list_display = ("production_order", "production_line", "date", "input_quantity", "output_quantity", "efficiency")


@admin.register(InspectionPacking)
class InspectionPackingAdmin(admin.ModelAdmin):
    list_display = ("production_order", "date", "inspected_quantity", "passed_quantity", "packed_quantity")


@admin.register(FloorRequisition)
class FloorRequisitionAdmin(admin.ModelAdmin):
    list_display = ("production_order", "item_type", "quantity_requested", "status")
    list_filter = ("status",)
