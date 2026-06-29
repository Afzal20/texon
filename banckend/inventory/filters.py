import django_filters
from .models import (
    Warehouse, WarehouseZone, InventoryItem, FabricRoll,
    StockTransaction, StockLevel, Requisition
)

class WarehouseFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Warehouse
        fields = ['name', 'location']

class WarehouseZoneFilter(django_filters.FilterSet):
    warehouse = django_filters.ModelChoiceFilter(queryset=Warehouse.objects.all())
    code = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = WarehouseZone
        fields = ['warehouse', 'code']

class InventoryItemFilter(django_filters.FilterSet):
    sku = django_filters.CharFilter(lookup_expr='icontains')
    name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = InventoryItem
        fields = ['sku', 'name', 'unit_of_measure']

class FabricRollFilter(django_filters.FilterSet):
    batch_no = django_filters.CharFilter(lookup_expr='icontains')
    inventory_item = django_filters.ModelChoiceFilter(queryset=InventoryItem.objects.all())
    warehouse_zone = django_filters.ModelChoiceFilter(queryset=WarehouseZone.objects.all())

    class Meta:
        model = FabricRoll
        fields = ['batch_no', 'inventory_item', 'warehouse_zone']

class StockTransactionFilter(django_filters.FilterSet):
    inventory_item = django_filters.ModelChoiceFilter(queryset=InventoryItem.objects.all())
    transaction_type = django_filters.ChoiceFilter(choices=StockTransaction.TRANSACTION_TYPES)
    start_date = django_filters.DateFilter(field_name='timestamp', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='timestamp', lookup_expr='lte')

    class Meta:
        model = StockTransaction
        fields = ['inventory_item', 'transaction_type', 'from_zone', 'to_zone', 'performed_by']

class StockLevelFilter(django_filters.FilterSet):
    inventory_item = django_filters.ModelChoiceFilter(queryset=InventoryItem.objects.all())
    warehouse_zone = django_filters.ModelChoiceFilter(queryset=WarehouseZone.objects.all())
    min_stock = django_filters.NumberFilter(field_name='current_stock', lookup_expr='gte')

    class Meta:
        model = StockLevel
        fields = ['inventory_item', 'warehouse_zone']

class RequisitionFilter(django_filters.FilterSet):
    inventory_item = django_filters.ModelChoiceFilter(queryset=InventoryItem.objects.all())
    status = django_filters.ChoiceFilter(choices=Requisition.STATUS_CHOICES)
    requested_by = django_filters.CharFilter(field_name='requested_by__email', lookup_expr='icontains')

    class Meta:
        model = Requisition
        fields = ['inventory_item', 'status', 'requested_by']
