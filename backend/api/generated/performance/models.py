from django.db import models
from django.conf import settings

class PerformanceRecord(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='performance_record_set',
    )
    style = models.IntegerField(null=True, blank=True)
    production_line = models.IntegerField(null=True, blank=True)
    record_date = models.DateField()
    metric = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=15, decimal_places=2)
    target = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=50)
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'performance_record'
        verbose_name = 'PerformanceRecord'
        verbose_name_plural = 'PerformanceRecords'

