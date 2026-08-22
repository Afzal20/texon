from django.db import models
from production.models import ProductionLine, ProductionOrder


class Schedule(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="schedules"
    )
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="schedules"
    )
    scheduled_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    target_quantity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("scheduled", "Scheduled"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("rescheduled", "Rescheduled"),
            ("cancelled", "Cancelled"),
        ],
        default="scheduled",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Schedule"
        verbose_name_plural = "Schedules"

    def __str__(self):
        return f"{self.production_line.name} - {self.scheduled_date}"
