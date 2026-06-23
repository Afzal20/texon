from django.db import models
from auditlog.registry import auditlog

class CertifyingAuthority(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="certifying_authorities")
    name = models.CharField(max_length=255)  # City Corporation, BFSCD
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class ComplianceCertificate(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="compliance_certificates")
    name = models.CharField(max_length=255)  # Fire License, BSCI
    authority = models.ForeignKey(CertifyingAuthority, on_delete=models.CASCADE)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    document = models.FileField(upload_to="compliance_documents/")  # django-storages support
    is_valid = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ESGMetric(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="esg_metrics")
    carbon_footprint_tonnes = models.DecimalField(max_digits=10, decimal_places=2)
    water_recycled_liters = models.DecimalField(max_digits=12, decimal_places=2)
    renewable_energy_kwh = models.DecimalField(max_digits=10, decimal_places=2)
    recorded_date = models.DateField()

    def __str__(self):
        return f"ESG metrics - {self.recorded_date}"

class Audit(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="audits")
    audit_name = models.CharField(max_length=255)  # BSCI Follow-up
    auditor = models.CharField(max_length=255)
    audit_date = models.DateField()
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    report_file = models.FileField(upload_to="audit_reports/", blank=True, null=True)

    def __str__(self):
        return f"{self.audit_name} on {self.audit_date}"

class AuditFinding(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name="findings")
    finding_description = models.TextField()
    severity = models.CharField(max_length=50)  # low, medium, high, critical
    remediation_plan = models.TextField(blank=True, null=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Finding ({self.severity}): {self.finding_description[:30]}"

class ComplianceScore(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="compliance_scores")
    social_score = models.DecimalField(max_digits=5, decimal_places=2)  # percentage, e.g. 98.00
    environmental_score = models.DecimalField(max_digits=5, decimal_places=2)
    safety_score = models.DecimalField(max_digits=5, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Scores: Social {self.social_score}%, Env {self.environmental_score}%, Safety {self.safety_score}%"

auditlog.register(CertifyingAuthority)
auditlog.register(ComplianceCertificate)
auditlog.register(ESGMetric)
auditlog.register(Audit)
auditlog.register(AuditFinding)
auditlog.register(ComplianceScore)
