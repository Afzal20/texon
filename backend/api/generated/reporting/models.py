from django.db import models
from django.conf import settings

class Dashboard(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='dashboard_set',
    )
    name = models.CharField(max_length=255)
    dashboard_type = models.CharField(max_length=50, choices=[('management', 'Management'), ('production', 'Production'), ('quality', 'Quality'), ('financial', 'Financial')])
    config = models.CharField(max_length=255)
    is_default = models.BooleanField()
    created_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'dashboard'
        verbose_name = 'Dashboard'
        verbose_name_plural = 'Dashboards'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class Report(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='report_set',
    )
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=[('mis', 'Mis'), ('production', 'Production'), ('efficiency', 'Efficiency'), ('quality', 'Quality'), ('financial', 'Financial'), ('inventory', 'Inventory'), ('hr', 'Hr'), ('custom', 'Custom')])
    parameters = models.CharField(max_length=255)
    generated_by = models.CharField(max_length=255)
    generated_at = models.DateTimeField(editable=False)
    file = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('generating', 'Generating'), ('ready', 'Ready'), ('failed', 'Failed')])
    notes = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'report'
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
    def __str__(self):
        return str(getattr(self, 'title', ''))

