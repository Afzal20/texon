from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    WarehouseViewSet, WarehouseZoneViewSet, InventoryItemViewSet,
    FabricRollViewSet, StockTransactionViewSet, StockLevelViewSet,
    RequisitionViewSet, DeadstockAlertViewSet, ReorderPredictionViewSet
)

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'warehouse-zones', WarehouseZoneViewSet, basename='warehouse-zone')
router.register(r'items', InventoryItemViewSet, basename='inventory-item')
router.register(r'fabric-rolls', FabricRollViewSet, basename='fabric-roll')
router.register(r'transactions', StockTransactionViewSet, basename='stock-transaction')
router.register(r'levels', StockLevelViewSet, basename='stock-level')
router.register(r'requisitions', RequisitionViewSet, basename='requisition')
router.register(r'deadstock-alerts', DeadstockAlertViewSet, basename='deadstock-alert')
router.register(r'reorder-predictions', ReorderPredictionViewSet, basename='reorder-prediction')

urlpatterns = [
    path('', include(router.urls)),
]
