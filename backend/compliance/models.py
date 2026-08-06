from django.db import models
from buyers.models import Buyer


class ComplianceRecord(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.SET_NULL, null=True, blank=True, related_name="compliance_records"
    )
    compliance_type = models.CharField(
        max_length=100,
        choices=[
            ("social", "Social Compliance"),
            ("environmental", "Environmental Compliance"),
            ("quality", "Quality Compliance"),
            ("safety", "Safety Compliance"),
            ("ethical", "Ethical Compliance"),
            ("other", "Other"),
        ],
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    audit_date = models.DateField()
    audit_by = models.CharField(max_length=255, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("planned", "Planned"),
            ("in_progress", "In Progress"),
            ("passed", "Passed"),
            ("failed", "Failed"),
            ("corrective_action", "Corrective Action Required"),
        ],
        default="planned",
    )
    findings = models.TextField(blank=True)
    corrective_actions = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Compliance Record"
        verbose_name_plural = "Compliance Records"

    def __str__(self):
        return f"{self.compliance_type} - {self.title} - {self.audit_date}"
