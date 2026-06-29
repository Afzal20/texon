from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewsets import (
    BottleneckAlertViewSet,
    DefectLogViewSet,
    DowntimeEventViewSet,
    HeatmapDataViewSet,
    OEELogViewSet,
    ProductionLineViewSet,
    ProductionRecordViewSet,
    ProductionShiftViewSet,
    ProductionUnitViewSet,
)

router = DefaultRouter()
router.register(r"units", ProductionUnitViewSet, basename="production-unit")
router.register(r"lines", ProductionLineViewSet, basename="production-line")
router.register(r"shifts", ProductionShiftViewSet, basename="production-shift")
router.register(r"records", ProductionRecordViewSet, basename="production-record")
router.register(r"oee", OEELogViewSet, basename="oee-log")
router.register(r"downtime", DowntimeEventViewSet, basename="downtime-event")
router.register(r"defects", DefectLogViewSet, basename="defect-log")
router.register(r"heatmap", HeatmapDataViewSet, basename="heatmap-data")
router.register(r"alerts", BottleneckAlertViewSet, basename="bottleneck-alert")

urlpatterns = [
    path("", include(router.urls)),
]
