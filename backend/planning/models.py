from django.db import models
from merchandising.models import Style, PurchaseOrder


class Plan(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="plans"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name="plans"
    )
    plan_type = models.CharField(
        max_length=50,
        choices=[
            ("production", "Production Plan"),
            ("capacity", "Capacity Plan"),
            ("material", "Material Plan"),
            ("delivery", "Delivery Plan"),
        ],
    )
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    details = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("draft", "Draft"), ("active", "Active"), ("completed", "Completed"), ("cancelled", "Cancelled")],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Plan"
        verbose_name_plural = "Plans"

    def __str__(self):
        return f"{self.plan_type} - {self.title}"
