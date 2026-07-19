from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"suppliers", views.SupplierViewSet, basename="supplier")
router.register(r"rm-requisitions", views.RawMaterialRequisitionViewSet, basename="rm-requisition")
router.register(r"rm-bookings", views.RawMaterialBookingViewSet, basename="rm-booking")
router.register(r"quotation-analyses", views.QuotationAnalysisViewSet, basename="quotation-analysis")

urlpatterns = router.urls
