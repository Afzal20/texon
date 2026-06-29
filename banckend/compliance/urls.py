from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    CertifyingAuthorityViewSet, ComplianceCertificateViewSet,
    ESGMetricViewSet, AuditViewSet, AuditFindingViewSet,
    ComplianceScoreViewSet
)

router = DefaultRouter()
router.register(r'authorities', CertifyingAuthorityViewSet, basename='certifying-authority')
router.register(r'certificates', ComplianceCertificateViewSet, basename='compliance-certificate')
router.register(r'esg-metrics', ESGMetricViewSet, basename='esg-metric')
router.register(r'audits', AuditViewSet, basename='audit')
router.register(r'audit-findings', AuditFindingViewSet, basename='audit-finding')
router.register(r'scores', ComplianceScoreViewSet, basename='compliance-score')

urlpatterns = [
    path('', include(router.urls)),
]
