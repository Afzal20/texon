from django.contrib import admin

from .models import ComplianceRecord


@admin.register(ComplianceRecord)
class ComplianceRecordAdmin(admin.ModelAdmin):
    list_display = ("compliance_type", "title", "buyer", "audit_date", "score", "status")
    list_filter = ("compliance_type", "status")
