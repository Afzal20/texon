from django.db import models
from core.models import Organization
from inventory.models import Fabric, Accessory, Trim


class Supplier(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="suppliers"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    supplier_type = models.CharField(
        max_length=50,
        choices=[
            ("fabric", "Fabric Supplier"),
            ("accessory", "Accessory Supplier"),
            ("trim", "Trim Supplier"),
            ("general", "General Supplier"),
        ],
        default="general",
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Supplier"
        verbose_name_plural = "Suppliers"
        unique_together = ("organization", "code")

    def __str__(self):
        return f"{self.name} ({self.code})"


class RawMaterialRequisition(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="rm_requisitions"
    )
    requisition_number = models.CharField(max_length=100)
    item_type = models.CharField(
        max_length=20,
        choices=[("fabric", "Fabric"), ("accessory", "Accessory"), ("trim", "Trim")],
    )
    item_id = models.PositiveIntegerField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    required_date = models.DateField()
    purpose = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("pending_approval", "Pending Approval"),
            ("approved", "Approved"),
            ("ordered", "Ordered"),
            ("received", "Received"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    requested_by = models.CharField(max_length=255)
    approved_by = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Raw Material Requisition"
        verbose_name_plural = "Raw Material Requisitions"
        unique_together = ("organization", "requisition_number")

    def __str__(self):
        return f"Req {self.requisition_number} - {self.item_type}"


class RawMaterialBooking(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="rm_bookings"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, related_name="bookings"
    )
    booking_number = models.CharField(max_length=100)
    booking_date = models.DateField()
    expected_delivery_date = models.DateField()
    item_type = models.CharField(
        max_length=20,
        choices=[("fabric", "Fabric"), ("accessory", "Accessory"), ("trim", "Trim")],
    )
    item_id = models.PositiveIntegerField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("confirmed", "Confirmed"),
            ("partial_received", "Partially Received"),
            ("received", "Fully Received"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Raw Material Booking"
        verbose_name_plural = "Raw Material Bookings"
        unique_together = ("organization", "booking_number")

    def __str__(self):
        return f"Booking {self.booking_number} - {self.supplier.name}"


class QuotationAnalysis(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="quotation_analyses"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, related_name="quotations"
    )
    item_type = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    quoted_price = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_terms = models.CharField(max_length=255, blank=True)
    payment_terms = models.CharField(max_length=255, blank=True)
    validity_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected"), ("negotiating", "Negotiating")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Quotation Analysis"
        verbose_name_plural = "Quotation Analyses"

    def __str__(self):
        return f"{self.supplier.name} - {self.item_type}"
