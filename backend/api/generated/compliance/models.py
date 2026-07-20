from django.db import models
from django.conf import settings

class ComplianceRecord(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='compliance_record_set',
    )
    buyer = models.IntegerField(null=True, blank=True)
    compliance_type = models.CharField(max_length=50, choices=[('social', 'Social'), ('environmental', 'Environmental'), ('quality', 'Quality'), ('safety', 'Safety'), ('ethical', 'Ethical'), ('other', 'Other')])
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    audit_date = models.DateField()
    audit_by = models.CharField(max_length=255)
    score = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('planned', 'Planned'), ('in_progress', 'In Progress'), ('passed', 'Passed'), ('failed', 'Failed'), ('corrective_action', 'Corrective Action')])
    findings = models.CharField(max_length=255)
    corrective_actions = models.CharField(max_length=255)
    follow_up_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'compliance_record'
        verbose_name = 'ComplianceRecord'
        verbose_name_plural = 'ComplianceRecords'
    def __str__(self):
        return str(getattr(self, 'title', ''))


class RiskAssessment(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='risk_assessment_set',
    )
    style = models.IntegerField()
    risk_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=50, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')])
    likelihood = models.CharField(max_length=50, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')])
    mitigation_plan = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('open', 'Open'), ('mitigated', 'Mitigated'), ('closed', 'Closed')])

    class Meta:
        db_table = 'risk_assessment'
        verbose_name = 'RiskAssessment'
        verbose_name_plural = 'RiskAssessments'

