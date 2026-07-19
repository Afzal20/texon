from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"lcs", views.LCViewSet)
router.register(r"shipments", views.ShipmentViewSet)
router.register(r"invoices", views.InvoiceViewSet)
router.register(r"bills-of-exchange", views.BillOfExchangeViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
