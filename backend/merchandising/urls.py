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
router.register(r"budget-demand-assessments", views.BudgetDemandAssessmentViewSet, basename="budget-demand-assessment")
router.register(r"ie-suggestions", views.IeSuggestionViewSet, basename="ie-suggestion")
router.register(r"skill-inventories", views.SkillInventoryViewSet, basename="skill-inventory")
router.register(r"production-downtimes", views.ProductionDowntimeViewSet, basename="production-downtime")
router.register(r"process-wise-targets", views.ProcessWiseTargetViewSet, basename="process-wise-target")

urlpatterns = router.urls
