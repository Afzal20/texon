from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"capacity-bookings", views.CapacityBookingViewSet, basename="capacity-booking")
router.register(r"line-plans", views.LinePlanViewSet, basename="line-plan")
router.register(r"production-plans", views.ProductionPlanViewSet, basename="production-plan")
router.register(r"risk-assessments", views.RiskAssessmentViewSet, basename="risk-assessment")
router.register(r"style-analyses", views.StyleAnalysisViewSet, basename="style-analysis")

urlpatterns = router.urls
