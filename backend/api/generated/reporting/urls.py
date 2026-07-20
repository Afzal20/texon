from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'dashboards', views.DashboardViewSet, basename='dashboards')
router.register(r'rejection-reports', views.ReportViewSet, basename='rejection-reports')

urlpatterns = router.urls