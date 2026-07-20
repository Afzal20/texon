from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'subcontract-orders', views.SubcontractOrderViewSet, basename='subcontract-orders')
router.register(r'subcontract-tracking', views.SubcontractTrackingViewSet, basename='subcontract-tracking')

urlpatterns = router.urls