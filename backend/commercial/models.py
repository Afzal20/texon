from django.db import models
from core.models import Organization, Currency
from buyers.models import Buyer
from merchandising.models import PurchaseOrder


class LC(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="lcs"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="lcs"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name="lcs"
    )
    lc_number = models.CharField(max_length=100)
    lc_type = models.CharField(
        max_length=50,
        choices=[
            ("export", "Export LC"),
            ("import", "Import LC"),
            ("btb", "BTB LC"),
        ],
    )
    issue_date = models.DateField()
    expiry_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    issuing_bank = models.CharField(max_length=255)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("issued", "Issued"),
            ("amended", "Amended"),
            ("expired", "Expired"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "LC"
        verbose_name_plural = "LCs"
        unique_together = ("organization", "lc_number")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.lc_type} - {self.lc_number}"


class Shipment(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="shipments"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="shipments"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="shipments"
    )
    shipment_number = models.CharField(max_length=100)
    shipment_date = models.DateField()
    etd = models.DateField(null=True, blank=True)
    eta = models.DateField(null=True, blank=True)
    port_of_loading = models.CharField(max_length=255)
    port_of_discharge = models.CharField(max_length=255)
    forwarder = models.CharField(max_length=255, blank=True)
    container_number = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField()
    gross_weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("booked", "Booked"),
            ("loaded", "Loaded"),
            ("shipped", "Shipped"),
            ("in_transit", "In Transit"),
            ("arrived", "Arrived"),
            ("delivered", "Delivered"),
        ],
        default="booked",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Shipment"
        verbose_name_plural = "Shipments"
        unique_together = ("organization", "shipment_number")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Shipment {self.shipment_number} - {self.buyer.name}"


class Invoice(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="commercial_invoices"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="commercial_invoices"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="commercial_invoices"
    )
    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("submitted", "Submitted"),
            ("approved", "Approved"),
            ("paid", "Paid"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Commercial Invoice"
        verbose_name_plural = "Commercial Invoices"
        unique_together = ("organization", "invoice_number")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.buyer.name}"


class BillOfExchange(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="bills_of_exchange"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="bills_of_exchange"
    )
    bill_number = models.CharField(max_length=100)
    issue_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("submitted", "Submitted"),
            ("accepted", "Accepted"),
            ("paid", "Paid"),
            ("dishonored", "Dishonored"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bill of Exchange"
        verbose_name_plural = "Bills of Exchange"
        unique_together = ("organization", "bill_number")
        ordering = ["-created_at"]

    def __str__(self):
        return f"BOE {self.bill_number} - {self.buyer.name}"
