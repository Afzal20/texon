from django.contrib import admin
from .models import Warehouse, WarehouseZone, InventoryItem, FabricRoll, StockTransaction, StockLevel, Requisition, DeadstockAlert, ReorderPrediction

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(WarehouseZone)
class WarehouseZoneAdmin(admin.ModelAdmin):
    list_display = ('code', 'warehouse')
    search_fields = ('code', 'warehouse__name')
    list_filter = ('warehouse',)

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'unit_of_measure', 'organization')
    search_fields = ('sku', 'name')
    list_filter = ('organization', 'unit_of_measure')

@admin.register(FabricRoll)
class FabricRollAdmin(admin.ModelAdmin):
    list_display = ('batch_no', 'inventory_item', 'length_yards', 'warehouse_zone', 'organization')
    search_fields = ('batch_no', 'inventory_item__name')
    list_filter = ('organization', 'warehouse_zone')

@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'transaction_type', 'quantity', 'from_zone', 'to_zone', 'timestamp', 'organization')
    search_fields = ('inventory_item__sku', 'transaction_type')
    list_filter = ('organization', 'transaction_type', 'timestamp')

@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'warehouse_zone', 'current_stock')
    search_fields = ('inventory_item__sku', 'warehouse_zone__code')
    list_filter = ('warehouse_zone',)

@admin.register(Requisition)
class RequisitionAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'quantity_requested', 'requested_by', 'status', 'created_at', 'organization')
    search_fields = ('inventory_item__sku', 'status')
    list_filter = ('organization', 'status', 'created_at')

@admin.register(DeadstockAlert)
class DeadstockAlertAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'risk_percentage', 'alert_message', 'created_at', 'organization')
    search_fields = ('inventory_item__sku',)
    list_filter = ('organization', 'created_at')

@admin.register(ReorderPrediction)
class ReorderPredictionAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'recommended_qty', 'prediction_confidence', 'created_at', 'organization')
    search_fields = ('inventory_item__sku',)
    list_filter = ('organization', 'created_at')
