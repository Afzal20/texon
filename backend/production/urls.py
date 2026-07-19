from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"production-lines", views.ProductionLineViewSet, basename="production-line")
router.register(r"production-orders", views.ProductionOrderViewSet, basename="production-order")
router.register(r"cutting-records", views.CuttingRecordViewSet, basename="cutting-record")
router.register(r"sewing-records", views.SewingRecordViewSet, basename="sewing-record")
router.register(
    r"inspection-packing",
    views.InspectionPackingViewSet,
    basename="inspection-packing",
)
router.register(
    r"floor-requisitions",
    views.FloorRequisitionViewSet,
    basename="floor-requisition",
)

urlpatterns = router.urls
