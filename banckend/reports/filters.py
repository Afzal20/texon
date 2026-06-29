import django_filters
from .models import (
    ReportTemplate, ReportRun, ScheduledReport, ExportJob
)

class ReportTemplateFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = ReportTemplate
        fields = ['name']

class ReportRunFilter(django_filters.FilterSet):
    template = django_filters.ModelChoiceFilter(queryset=ReportTemplate.objects.all())

    class Meta:
        model = ReportRun
        fields = ['template', 'run_by']

class ScheduledReportFilter(django_filters.FilterSet):
    template = django_filters.ModelChoiceFilter(queryset=ReportTemplate.objects.all())

    class Meta:
        model = ScheduledReport
        fields = ['template', 'frequency', 'is_active']

class ExportJobFilter(django_filters.FilterSet):
    class Meta:
        model = ExportJob
        fields = ['job_type', 'status']
