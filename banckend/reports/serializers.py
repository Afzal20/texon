from rest_framework import serializers
from .models import (
    ReportTemplate, ReportRun, ScheduledReport, ExportJob
)

class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = ['id', 'organization', 'name', 'config_data', 'created_at']
        read_only_fields = ['id', 'organization', 'created_at']

class ReportRunSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    run_by_email = serializers.CharField(source='run_by.email', read_only=True)

    class Meta:
        model = ReportRun
        fields = [
            'id', 'organization', 'template', 'template_name',
            'run_by', 'run_by_email', 'generated_file', 'created_at'
        ]
        read_only_fields = ['id', 'organization', 'run_by', 'created_at']

class ScheduledReportSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = ScheduledReport
        fields = [
            'id', 'organization', 'template', 'template_name',
            'frequency', 'email_recipients', 'is_active'
        ]
        read_only_fields = ['id', 'organization']

class ExportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportJob
        fields = [
            'id', 'organization', 'job_type', 'status',
            'result_file', 'created_at'
        ]
        read_only_fields = ['id', 'organization', 'created_at']
