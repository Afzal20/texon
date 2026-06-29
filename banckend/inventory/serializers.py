from rest_framework import serializers
from .models import (
    Warehouse, WarehouseZone, InventoryItem, FabricRoll,
    StockTransaction, StockLevel, Requisition,
    DeadstockAlert, ReorderPrediction
)

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'organization', 'name', 'location']
        read_only_fields = ['id', 'organization']

class WarehouseZoneSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = WarehouseZone
        fields = ['id', 'warehouse', 'warehouse_name', 'code']
        read_only_fields = ['id']

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'organization', 'sku', 'name', 'description', 'unit_of_measure', 'created_at']
        read_only_fields = ['id', 'organization', 'created_at']

class FabricRollSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True)
    zone_code = serializers.CharField(source='warehouse_zone.code', read_only=True)

    class Meta:
        model = FabricRoll
        fields = [
            'id', 'organization', 'inventory_item', 'inventory_item_sku',
            'batch_no', 'length_yards', 'warehouse_zone', 'zone_code'
        ]
        read_only_fields = ['id', 'organization']

class StockTransactionSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True)
    performed_by_email = serializers.CharField(source='performed_by.email', read_only=True)
    from_zone_code = serializers.CharField(source='from_zone.code', read_only=True)
    to_zone_code = serializers.CharField(source='to_zone.code', read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            'id', 'organization', 'inventory_item', 'inventory_item_sku',
            'transaction_type', 'quantity', 'from_zone', 'from_zone_code',
            'to_zone', 'to_zone_code', 'performed_by', 'performed_by_email', 'timestamp'
        ]
        read_only_fields = ['id', 'organization', 'performed_by', 'timestamp']

class StockLevelSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True)
    inventory_item_name = serializers.CharField(source='inventory_item.name', read_only=True)
    zone_code = serializers.CharField(source='warehouse_zone.code', read_only=True)

    class Meta:
        model = StockLevel
        fields = [
            'id', 'warehouse_zone', 'zone_code', 'inventory_item',
            'inventory_item_sku', 'inventory_item_name', 'current_stock'
        ]
        read_only_fields = ['id', 'current_stock']

class RequisitionSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True)
    requested_by_email = serializers.CharField(source='requested_by.email', read_only=True)

    class Meta:
        model = Requisition
        fields = [
            'id', 'organization', 'inventory_item', 'inventory_item_sku',
            'quantity_requested', 'requested_by', 'requested_by_email',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'organization', 'requested_by', 'created_at']

class DeadstockAlertSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True)

    class Meta:
        model = DeadstockAlert
        fields = [
            'id', 'organization', 'inventory_item', 'inventory_item_sku',
            'risk_percentage', 'alert_message', 'created_at'
        ]
        read_only_fields = ['id', 'organization', 'created_at']

class ReorderPredictionSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True)

    class Meta:
        model = ReorderPrediction
        fields = [
            'id', 'organization', 'inventory_item', 'inventory_item_sku',
            'recommended_qty', 'prediction_confidence', 'created_at'
        ]
        read_only_fields = ['id', 'organization', 'created_at']
