from django.contrib import admin

from .models import Dashboard, Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("title", "report_type", "generated_by", "generated_at", "status")
    list_filter = ("report_type", "status")


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ("name", "dashboard_type", "organization", "is_default", "created_by")
    list_filter = ("dashboard_type", "is_default")
