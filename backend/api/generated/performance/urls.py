from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'performance-records', views.PerformanceRecordViewSet, basename='performance-records')

urlpatterns = router.urls