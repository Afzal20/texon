from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"warehouses", views.WarehouseViewSet, basename="warehouse")
router.register(r"fabrics", views.FabricViewSet, basename="fabric")
router.register(r"accessories", views.AccessoryViewSet, basename="accessory")
router.register(r"trims", views.TrimViewSet, basename="trim")
router.register(r"stock-movements", views.StockMovementViewSet, basename="stock-movement")
router.register(r"shade-approvals", views.ShadeApprovalViewSet, basename="shade-approval")
router.register(r"physical-inventories", views.PhysicalInventoryViewSet, basename="physical-inventory")

urlpatterns = router.urls
