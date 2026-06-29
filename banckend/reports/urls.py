from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    ReportTemplateViewSet, ReportRunViewSet,
    ScheduledReportViewSet, ExportJobViewSet
)

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet, basename='report-template')
router.register(r'runs', ReportRunViewSet, basename='report-run')
router.register(r'scheduled', ScheduledReportViewSet, basename='scheduled-report')
router.register(r'exports', ExportJobViewSet, basename='export-job')

urlpatterns = [
    path('', include(router.urls)),
]
