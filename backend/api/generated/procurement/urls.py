from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'purchase-orders', views.PurchaseOrderViewSet, basename='purchase-orders')
router.register(r'quotation-analyses', views.QuotationAnalysisViewSet, basename='quotation-analyses')
router.register(r'rm-bookings', views.RawMaterialBookingViewSet, basename='rm-bookings')
router.register(r'rm-requisitions', views.RawMaterialRequisitionViewSet, basename='rm-requisitions')
router.register(r'suppliers', views.SupplierViewSet, basename='suppliers')

urlpatterns = router.urls