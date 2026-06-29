from rest_framework import serializers
from .models import (
    CertifyingAuthority, ComplianceCertificate, ESGMetric,
    Audit, AuditFinding, ComplianceScore
)

class CertifyingAuthoritySerializer(serializers.ModelSerializer):
    class Meta:
        model = CertifyingAuthority
        fields = ['id', 'organization', 'name', 'description']
        read_only_fields = ['id', 'organization']

class ComplianceCertificateSerializer(serializers.ModelSerializer):
    authority_name = serializers.CharField(source='authority.name', read_only=True)

    class Meta:
        model = ComplianceCertificate
        fields = [
            'id', 'organization', 'name', 'authority', 'authority_name',
            'issue_date', 'expiry_date', 'document', 'is_valid'
        ]
        read_only_fields = ['id', 'organization']

class ESGMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGMetric
        fields = [
            'id', 'organization', 'carbon_footprint_tonnes',
            'water_recycled_liters', 'renewable_energy_kwh', 'recorded_date'
        ]
        read_only_fields = ['id', 'organization']

class AuditFindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditFinding
        fields = [
            'id', 'audit', 'finding_description', 'severity',
            'remediation_plan', 'is_resolved'
        ]
        read_only_fields = ['id']

class AuditSerializer(serializers.ModelSerializer):
    findings = AuditFindingSerializer(many=True, read_only=True)

    class Meta:
        model = Audit
        fields = [
            'id', 'organization', 'audit_name', 'auditor', 'audit_date',
            'score', 'report_file', 'findings'
        ]
        read_only_fields = ['id', 'organization']

class ComplianceScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceScore
        fields = [
            'id', 'organization', 'social_score', 'environmental_score',
            'safety_score', 'updated_at'
        ]
        read_only_fields = ['id', 'organization', 'updated_at']
