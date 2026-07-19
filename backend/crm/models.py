from django.db import models
from core.models import Organization
from buyers.models import Buyer
from merchandising.models import PurchaseOrder


class BuyerCommunication(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="buyer_communications"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="communications"
    )
    communication_type = models.CharField(
        max_length=50,
        choices=[
            ("email", "Email"),
            ("phone", "Phone Call"),
            ("meeting", "Meeting"),
            ("site_visit", "Site Visit"),
            ("video_call", "Video Call"),
            ("other", "Other"),
        ],
    )
    subject = models.CharField(max_length=255)
    content = models.TextField()
    contact_person = models.CharField(max_length=255, blank=True)
    communication_date = models.DateTimeField()
    follow_up_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("completed", "Completed"), ("pending_follow_up", "Pending Follow-up"), ("closed", "Closed")],
        default="completed",
    )
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Buyer Communication"
        verbose_name_plural = "Buyer Communications"

    def __str__(self):
        return f"{self.communication_type} - {self.subject}"


class BuyerProfitability(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="profitability_records"
    )
    period_start = models.DateField()
    period_end = models.DateField()
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2)
    total_cost = models.DecimalField(max_digits=15, decimal_places=2)
    profit = models.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Buyer Profitability"
        verbose_name_plural = "Buyer Profitability"

    def __str__(self):
        return f"{self.buyer.name} - {self.period_start} to {self.period_end}"


class OrderAmendmentHistory(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="amendments"
    )
    amendment_date = models.DateField()
    previous_value = models.TextField()
    new_value = models.TextField()
    reason = models.TextField()
    amended_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Order Amendment History"
        verbose_name_plural = "Order Amendment Histories"

    def __str__(self):
        return f"Amendment - {self.purchase_order.po_number} - {self.amendment_date}"
