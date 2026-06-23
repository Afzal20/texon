from django.db import models
from auditlog.registry import auditlog

class ReportTemplate(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="report_templates")
    name = models.CharField(max_length=255)
    config_data = models.JSONField()  # Saved report configurations
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ReportRun(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="report_runs")
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE)
    run_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True)
    generated_file = models.FileField(upload_to="generated_reports/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Run: {self.template.name} on {self.created_at}"

class ScheduledReport(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="scheduled_reports")
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE)
    frequency = models.CharField(max_length=50)  # daily, weekly, monthly
    email_recipients = models.TextField()  # Comma-separated list of emails
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Sched: {self.template.name} ({self.frequency})"

class ExportJob(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="export_jobs")
    job_type = models.CharField(max_length=100)  # PDF, Excel generation
    status = models.CharField(max_length=50, default="pending")  # pending, running, completed, failed
    result_file = models.FileField(upload_to="exports/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Export Job: {self.job_type} ({self.status})"

auditlog.register(ReportTemplate)
auditlog.register(ReportRun)
auditlog.register(ScheduledReport)
auditlog.register(ExportJob)
