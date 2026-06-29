import django_filters
from .models import (
    CertifyingAuthority, ComplianceCertificate, ESGMetric,
    Audit, AuditFinding
)

class ComplianceCertificateFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    authority = django_filters.ModelChoiceFilter(queryset=CertifyingAuthority.objects.all())

    class Meta:
        model = ComplianceCertificate
        fields = ['name', 'authority', 'is_valid']

class ESGMetricFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='recorded_date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='recorded_date', lookup_expr='lte')

    class Meta:
        model = ESGMetric
        fields = []

class AuditFilter(django_filters.FilterSet):
    audit_name = django_filters.CharFilter(lookup_expr='icontains')
    auditor = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Audit
        fields = ['audit_name', 'auditor']

class AuditFindingFilter(django_filters.FilterSet):
    class Meta:
        model = AuditFinding
        fields = ['audit', 'severity', 'is_resolved']
