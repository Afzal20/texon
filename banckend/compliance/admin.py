from django.contrib import admin
from .models import CertifyingAuthority, ComplianceCertificate, ESGMetric, Audit, AuditFinding, ComplianceScore

@admin.register(CertifyingAuthority)
class CertifyingAuthorityAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(ComplianceCertificate)
class ComplianceCertificateAdmin(admin.ModelAdmin):
    list_display = ('name', 'authority', 'issue_date', 'expiry_date', 'is_valid', 'organization')
    search_fields = ('name', 'authority__name')
    list_filter = ('organization', 'is_valid', 'expiry_date')

@admin.register(ESGMetric)
class ESGMetricAdmin(admin.ModelAdmin):
    list_display = ('recorded_date', 'carbon_footprint_tonnes', 'water_recycled_liters', 'renewable_energy_kwh', 'organization')
    list_filter = ('organization', 'recorded_date')

class AuditFindingInline(admin.TabularInline):
    model = AuditFinding
    extra = 1

@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ('audit_name', 'auditor', 'audit_date', 'score', 'organization')
    search_fields = ('audit_name', 'auditor')
    list_filter = ('organization', 'audit_date')
    inlines = [AuditFindingInline]

@admin.register(AuditFinding)
class AuditFindingAdmin(admin.ModelAdmin):
    list_display = ('audit', 'finding_description', 'severity', 'is_resolved')
    search_fields = ('finding_description',)
    list_filter = ('severity', 'is_resolved')

@admin.register(ComplianceScore)
class ComplianceScoreAdmin(admin.ModelAdmin):
    list_display = ('social_score', 'environmental_score', 'safety_score', 'updated_at', 'organization')
    list_filter = ('organization',)
