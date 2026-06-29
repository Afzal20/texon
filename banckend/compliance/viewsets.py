from rest_framework import viewsets, status
from django_filters.rest_framework import DjangoFilterBackend
from skeleton.pagination import ProductionPagination
from skeleton.permissions import IsOrganizationMember

from .models import (
    CertifyingAuthority, ComplianceCertificate, ESGMetric,
    Audit, AuditFinding, ComplianceScore
)
from .serializers import (
    CertifyingAuthoritySerializer, ComplianceCertificateSerializer,
    ESGMetricSerializer, AuditSerializer, AuditFindingSerializer,
    ComplianceScoreSerializer
)
from .filters import (
    ComplianceCertificateFilter, ESGMetricFilter, AuditFilter,
    AuditFindingFilter
)

class BaseComplianceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class CertifyingAuthorityViewSet(BaseComplianceViewSet):
    queryset = CertifyingAuthority.objects.all()
    serializer_class = CertifyingAuthoritySerializer

class ComplianceCertificateViewSet(BaseComplianceViewSet):
    queryset = ComplianceCertificate.objects.all()
    serializer_class = ComplianceCertificateSerializer
    filterset_class = ComplianceCertificateFilter

class ESGMetricViewSet(BaseComplianceViewSet):
    queryset = ESGMetric.objects.all()
    serializer_class = ESGMetricSerializer
    filterset_class = ESGMetricFilter

class AuditViewSet(BaseComplianceViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    filterset_class = AuditFilter

class AuditFindingViewSet(viewsets.ModelViewSet):
    queryset = AuditFinding.objects.all()
    serializer_class = AuditFindingSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = AuditFindingFilter

    def get_queryset(self):
        return self.queryset.filter(audit__organization=self.request.user.organization)

class ComplianceScoreViewSet(BaseComplianceViewSet):
    queryset = ComplianceScore.objects.all()
    serializer_class = ComplianceScoreSerializer
