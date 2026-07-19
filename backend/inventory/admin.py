from django.contrib import admin

from .models import (
    Accessory,
    Fabric,
    PhysicalInventory,
    ShadeApproval,
    StockMovement,
    Trim,
    Warehouse,
)


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "location", "is_active")
    search_fields = ("name", "code")


@admin.register(Fabric)
class FabricAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "warehouse", "quantity", "unit", "threshold_quantity", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(Accessory)
class AccessoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "warehouse", "quantity", "unit", "threshold_quantity", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(Trim)
class TrimAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "warehouse", "quantity", "unit", "threshold_quantity", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("item_type", "item_id", "movement_type", "quantity", "from_warehouse", "to_warehouse", "created_at")
    list_filter = ("movement_type", "item_type")


@admin.register(ShadeApproval)
class ShadeApprovalAdmin(admin.ModelAdmin):
    list_display = ("fabric", "shade_name", "shade_code", "approved_by", "approval_date", "status")
    list_filter = ("status",)


@admin.register(PhysicalInventory)
class PhysicalInventoryAdmin(admin.ModelAdmin):
    list_display = ("warehouse", "inventory_date", "status", "created_by")
    list_filter = ("status",)
