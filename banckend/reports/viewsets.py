from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from skeleton.pagination import ProductionPagination
from skeleton.permissions import IsOrganizationMember

from .models import (
    ReportTemplate, ReportRun, ScheduledReport, ExportJob
)
from .serializers import (
    ReportTemplateSerializer, ReportRunSerializer,
    ScheduledReportSerializer, ExportJobSerializer
)
from .filters import (
    ReportTemplateFilter, ReportRunFilter,
    ScheduledReportFilter, ExportJobFilter
)

class BaseReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class ReportTemplateViewSet(BaseReportViewSet):
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    filterset_class = ReportTemplateFilter

    @action(detail=True, methods=['get'])
    def execute_report(self, request, pk=None):
        """
        Executes a report template and returns JSON data for frontend graphs.
        This runs via HTTP when the client requests data.
        """
        template = self.get_object()
        
        # Here we would normally parse `template.config_data`,
        # run a dynamic SQL query or ORM aggregation, and return data.
        # For MVP, we return a mock structured response suitable for charting (e.g. Recharts).
        
        mock_chart_data = {
            "title": template.name,
            "series": [
                {"name": "Jan", "value": 400},
                {"name": "Feb", "value": 300},
                {"name": "Mar", "value": 500},
                {"name": "Apr", "value": 200},
                {"name": "May", "value": 600},
            ]
        }

        # Optionally log the run
        ReportRun.objects.create(
            organization=request.user.organization,
            template=template,
            run_by=request.user
        )

        return Response(mock_chart_data)

class ReportRunViewSet(BaseReportViewSet):
    queryset = ReportRun.objects.all()
    serializer_class = ReportRunSerializer
    filterset_class = ReportRunFilter

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            run_by=self.request.user
        )

class ScheduledReportViewSet(BaseReportViewSet):
    queryset = ScheduledReport.objects.all()
    serializer_class = ScheduledReportSerializer
    filterset_class = ScheduledReportFilter

class ExportJobViewSet(BaseReportViewSet):
    queryset = ExportJob.objects.all()
    serializer_class = ExportJobSerializer
    filterset_class = ExportJobFilter
