from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'bills-of-exchange', views.BillOfExchangeViewSet, basename='bills-of-exchange')
router.register(r'lcs', views.LCViewSet, basename='lcs')
router.register(r'shipments', views.ShipmentViewSet, basename='shipments')

urlpatterns = router.urls