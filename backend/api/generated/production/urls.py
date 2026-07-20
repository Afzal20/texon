from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'cutting-records', views.CuttingRecordViewSet, basename='cutting-records')
router.register(r'floor-requisitions', views.FloorRequisitionViewSet, basename='floor-requisitions')
router.register(r'inspection-packing', views.InspectionPackingViewSet, basename='inspection-packing')
router.register(r'production-lines', views.ProductionLineViewSet, basename='production-lines')
router.register(r'production-orders', views.ProductionOrderViewSet, basename='production-orders')
router.register(r'sewing-records', views.SewingRecordViewSet, basename='sewing-records')

urlpatterns = router.urls