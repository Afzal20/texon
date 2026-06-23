from django.contrib import admin
from .models import ReportTemplate, ReportRun, ScheduledReport, ExportJob

@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(ReportRun)
class ReportRunAdmin(admin.ModelAdmin):
    list_display = ('template', 'run_by', 'created_at', 'organization')
    search_fields = ('template__name',)
    list_filter = ('organization', 'created_at')

@admin.register(ScheduledReport)
class ScheduledReportAdmin(admin.ModelAdmin):
    list_display = ('template', 'frequency', 'is_active', 'organization')
    search_fields = ('template__name',)
    list_filter = ('organization', 'frequency', 'is_active')

@admin.register(ExportJob)
class ExportJobAdmin(admin.ModelAdmin):
    list_display = ('job_type', 'status', 'created_at', 'organization')
    search_fields = ('job_type',)
    list_filter = ('organization', 'status', 'created_at')
