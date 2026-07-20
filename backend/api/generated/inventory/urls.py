from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'accessories', views.AccessoryViewSet, basename='accessories')
router.register(r'fabric-inspections', views.FabricViewSet, basename='fabric-inspections')
router.register(r'physical-inventories', views.PhysicalInventoryViewSet, basename='physical-inventories')
router.register(r'shade-approvals', views.ShadeApprovalViewSet, basename='shade-approvals')
router.register(r'stock-movements', views.StockMovementViewSet, basename='stock-movements')
router.register(r'trims', views.TrimViewSet, basename='trims')
router.register(r'warehouses', views.WarehouseViewSet, basename='warehouses')

urlpatterns = router.urls