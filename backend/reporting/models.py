from django.db import models
from core.models import Organization


class Report(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="reports"
    )
    title = models.CharField(max_length=255)
    report_type = models.CharField(
        max_length=100,
        choices=[
            ("mis", "MIS Report"),
            ("production", "Production Report"),
            ("efficiency", "Efficiency Report"),
            ("quality", "Quality Report"),
            ("financial", "Financial Report"),
            ("inventory", "Inventory Report"),
            ("hr", "HR Report"),
            ("custom", "Custom Report"),
        ],
    )
    parameters = models.JSONField(default=dict, blank=True)
    generated_by = models.CharField(max_length=255)
    generated_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to="reports/", null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("generating", "Generating"), ("ready", "Ready"), ("failed", "Failed")],
        default="generating",
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Reports"

    def __str__(self):
        return f"{self.report_type} - {self.title} - {self.generated_at}"


class Dashboard(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="dashboards"
    )
    name = models.CharField(max_length=255)
    dashboard_type = models.CharField(
        max_length=50,
        choices=[
            ("management", "Management Dashboard"),
            ("production", "Production Dashboard"),
            ("quality", "Quality Dashboard"),
            ("financial", "Financial Dashboard"),
        ],
    )
    config = models.JSONField(default=dict, help_text="Dashboard widget configuration")
    is_default = models.BooleanField(default=False)
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Dashboard"
        verbose_name_plural = "Dashboards"

    def __str__(self):
        return f"{self.dashboard_type} - {self.name}"
