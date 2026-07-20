from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'capacity-bookings', views.CapacityBookingViewSet, basename='capacity-bookings')
router.register(r'line-plans', views.LinePlanViewSet, basename='line-plans')
router.register(r'production-plans', views.ProductionPlanViewSet, basename='production-plans')
router.register(r'depreciation-schedules', views.ScheduleViewSet, basename='depreciation-schedules')

urlpatterns = router.urls