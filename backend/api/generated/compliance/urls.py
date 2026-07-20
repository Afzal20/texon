from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'compliance-records', views.ComplianceRecordViewSet, basename='compliance-records')
router.register(r'risk-assessments', views.RiskAssessmentViewSet, basename='risk-assessments')

urlpatterns = router.urls