from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(
    r"performance-records",
    views.PerformanceRecordViewSet,
    basename="performance-record",
)

urlpatterns = [
    path("performance/dashboard-summary/", views.dashboard_summary, name="performance-dashboard-summary"),
    path("", include(router.urls)),
]
