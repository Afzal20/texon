from django.db import models
from core.models import Organization
from merchandising.models import Style, PurchaseOrder


class SubcontractOrder(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="subcontract_orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="subcontract_orders"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name="subcontract_orders"
    )
    order_number = models.CharField(max_length=100)
    subcontractor_name = models.CharField(max_length=255)
    process = models.CharField(
        max_length=100,
        choices=[
            ("cutting", "Cutting"),
            ("sewing", "Sewing"),
            ("washing", "Washing"),
            ("embroidery", "Embroidery"),
            ("printing", "Printing"),
            ("finishing", "Finishing"),
            ("packing", "Packing"),
        ],
    )
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    start_date = models.DateField()
    expected_completion = models.DateField()
    actual_completion = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("delayed", "Delayed"),
            ("cancelled", "Cancelled"),
        ],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Subcontract Order"
        verbose_name_plural = "Subcontract Orders"
        unique_together = ("organization", "order_number")

    def __str__(self):
        return f"Subcontract {self.order_number} - {self.subcontractor_name}"


class SubcontractTracking(models.Model):
    subcontract_order = models.ForeignKey(
        SubcontractOrder, on_delete=models.CASCADE, related_name="tracking_entries"
    )
    tracking_date = models.DateField()
    quantity_received = models.PositiveIntegerField(default=0)
    quantity_passed = models.PositiveIntegerField(default=0)
    quantity_rejected = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=100)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Subcontract Tracking"
        verbose_name_plural = "Subcontract Tracking"

    def __str__(self):
        return f"{self.subcontract_order.order_number} - {self.tracking_date}"
