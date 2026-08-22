from django.db import models
from buyers.models import Buyer
from merchandising.models import Style


class Order(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="orders"
    )
    order_number = models.CharField(max_length=100)
    order_date = models.DateField()
    delivery_date = models.DateField()
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("confirmed", "Confirmed"),
            ("in_production", "In Production"),
            ("shipped", "Shipped"),
            ("delivered", "Delivered"),
            ("cancelled", "Cancelled"),
        ],
        default="pending",
    )
    priority = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High"), ("urgent", "Urgent")],
        default="medium",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        unique_together = ("order_number",)
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order {self.order_number} - {self.buyer.name}"
