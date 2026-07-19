from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"reports", views.ReportViewSet, basename="report")
router.register(r"dashboards", views.DashboardViewSet, basename="dashboard")

urlpatterns = router.urls
