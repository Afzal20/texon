from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(
    r"compliance-records", views.ComplianceRecordViewSet, basename="compliance-record"
)

urlpatterns = router.urls
