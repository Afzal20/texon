from django.db import models
from buyers.models import Buyer
from merchandising.models import Style


class PreCosting(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="pre_costings"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="pre_costings"
    )
    cost_date = models.DateField()
    estimated_fabric_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_accessory_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_trim_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_labor_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_overhead = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_estimated_cost = models.DecimalField(max_digits=15, decimal_places=2)
    target_price = models.DecimalField(max_digits=15, decimal_places=2)
    expected_margin = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[("draft", "Draft"), ("approved", "Approved"), ("revised", "Revised")],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "PreCosting"
        verbose_name_plural = "PreCostings"

    def __str__(self):
        return f"PreCosting - {self.style.style_number} - {self.cost_date}"


class CostSheet(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="cost_sheets"
    )
    cost_date = models.DateField()
    fabric_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    accessory_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    trim_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    labor_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    overhead_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commercial_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=15, decimal_places=2)
    selling_price = models.DecimalField(max_digits=15, decimal_places=2)
    margin = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[("draft", "Draft"), ("final", "Final"), ("revised", "Revised")],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "CostSheet"
        verbose_name_plural = "CostSheets"

    def __str__(self):
        return f"CostSheet - {self.style.style_number} - {self.cost_date}"
