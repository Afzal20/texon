from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"styles", views.StyleViewSet, basename="style")
router.register(r"buyer-enquiries", views.BuyerEnquiryViewSet, basename="buyer-enquiry")
router.register(r"purchase-orders", views.PurchaseOrderViewSet, basename="purchase-order")
router.register(r"sample-orders", views.SampleOrderViewSet, basename="sample-order")
router.register(r"smv-records", views.SMVRecordViewSet, basename="smv-record")
router.register(
    r"development-monitoring",
    views.DevelopmentMonitoringViewSet,
    basename="development-monitoring",
)

urlpatterns = router.urls
