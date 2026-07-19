from django.db import models
from core.models import Organization
from buyers.models import Buyer


class Style(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="styles"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="styles"
    )
    name = models.CharField(max_length=255)
    style_number = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Style"
        verbose_name_plural = "Styles"
        unique_together = ("organization", "style_number")

    def __str__(self):
        return f"{self.style_number} - {self.name}"


class BuyerEnquiry(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="buyer_enquiries"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="enquiries"
    )
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="enquiries"
    )
    enquiry_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("received", "Received"),
            ("under_review", "Under Review"),
            ("quoted", "Quoted"),
            ("converted", "Converted to Order"),
            ("lost", "Lost"),
        ],
        default="received",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Buyer Enquiry"
        verbose_name_plural = "Buyer Enquiries"

    def __str__(self):
        return f"Enquiry from {self.buyer.name} on {self.enquiry_date}"


class PurchaseOrder(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    po_number = models.CharField(max_length=100)
    order_date = models.DateField()
    delivery_date = models.DateField()
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("confirmed", "Confirmed"),
            ("in_production", "In Production"),
            ("shipped", "Shipped"),
            ("delivered", "Delivered"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"
        unique_together = ("organization", "po_number")

    def __str__(self):
        return f"PO {self.po_number} - {self.buyer.name}"


class SampleOrder(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="sample_orders"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="sample_orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="sample_orders"
    )
    sample_type = models.CharField(
        max_length=50,
        choices=[
            ("fit", "Fit Sample"),
            ("pp", "PP Sample"),
            ("size_set", "Size Set"),
            ("pre_production", "Pre-Production"),
            ("photo", "Photo Sample"),
            ("shipping", "Shipping Sample"),
        ],
    )
    quantity = models.PositiveIntegerField()
    request_date = models.DateField()
    deadline = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("requested", "Requested"),
            ("in_progress", "In Progress"),
            ("submitted", "Submitted"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="requested",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sample Order"
        verbose_name_plural = "Sample Orders"

    def __str__(self):
        return f"{self.sample_type} - {self.style.style_number}"


class SMVRecord(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="smv_records"
    )
    smv = models.DecimalField(max_digits=8, decimal_places=2)
    calculated_by = models.CharField(max_length=255)
    calculation_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "SMV Record"
        verbose_name_plural = "SMV Records"

    def __str__(self):
        return f"{self.style.style_number}: {self.smv} SMV"


class DevelopmentMonitoring(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="development_monitoring"
    )
    supplier = models.CharField(max_length=255)
    stage = models.CharField(max_length=100)
    start_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("in_progress", "In Progress"), ("completed", "Completed")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Development Monitoring"
        verbose_name_plural = "Development Monitoring"

    def __str__(self):
        return f"{self.style.style_number} - {self.stage}"
