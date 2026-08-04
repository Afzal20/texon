from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"shipments", views.ShipmentViewSet)
router.register(r"lcs", views.LetterOfCreditViewSet)
router.register(r"invoices", views.InvoiceViewSet)
router.register(r"bills-of-exchange", views.BillOfExchangeViewSet)
router.register(r"supplier-documents", views.SupplierDocumentViewSet)
router.register(r"realizations", views.RealizationViewSet)
router.register(r"sod-fc-transfers", views.SODFCTransferViewSet)
router.register(r"disbursements", views.DisbursementViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
