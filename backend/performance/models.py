from django.db import models
from merchandising.models import Style
from production.models import ProductionLine


class PerformanceRecord(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="performance_records"
    )
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.SET_NULL, null=True, blank=True, related_name="performance_records"
    )
    record_date = models.DateField()
    metric = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    target = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Performance Record"
        verbose_name_plural = "Performance Records"

    def __str__(self):
        return f"{self.metric} - {self.record_date}: {self.value}"
