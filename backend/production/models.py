from django.db import models
from core.models import Organization
from merchandising.models import Style, PurchaseOrder
from ie_planning.models import ProductionPlan


class ProductionLine(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="production_lines"
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=255, blank=True)
    capacity = models.PositiveIntegerField(help_text="Daily capacity in pieces")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Production Line"
        verbose_name_plural = "Production Lines"
        unique_together = ("organization", "code")

    def __str__(self):
        return f"{self.name} ({self.code})"


class ProductionOrder(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="production_orders"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="production_orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="production_orders"
    )
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.SET_NULL, null=True, blank=True, related_name="production_orders"
    )
    order_number = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("released", "Released"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("on_hold", "On Hold"),
            ("cancelled", "Cancelled"),
        ],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Production Order"
        verbose_name_plural = "Production Orders"
        unique_together = ("organization", "order_number")

    def __str__(self):
        return f"PO {self.order_number} - {self.style.style_number}"


class CuttingRecord(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="cutting_records"
    )
    date = models.DateField()
    quantity_cut = models.PositiveIntegerField()
    fabric_used = models.DecimalField(max_digits=10, decimal_places=2, help_text="Fabric used in yards/meters")
    waste_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cutting Record"
        verbose_name_plural = "Cutting Records"

    def __str__(self):
        return f"Cutting {self.production_order.order_number} - {self.date}"


class SewingRecord(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="sewing_records"
    )
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.SET_NULL, null=True, related_name="sewing_records"
    )
    date = models.DateField()
    input_quantity = models.PositiveIntegerField()
    output_quantity = models.PositiveIntegerField()
    defect_quantity = models.PositiveIntegerField(default=0)
    efficiency = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sewing Record"
        verbose_name_plural = "Sewing Records"

    def __str__(self):
        return f"Sewing {self.production_order.order_number} - {self.date}"


class InspectionPacking(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="inspection_packing"
    )
    date = models.DateField()
    inspected_quantity = models.PositiveIntegerField()
    passed_quantity = models.PositiveIntegerField()
    failed_quantity = models.PositiveIntegerField(default=0)
    packed_quantity = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inspection & Packing"
        verbose_name_plural = "Inspection & Packing"

    def __str__(self):
        return f"Inspection {self.production_order.order_number} - {self.date}"


class FloorRequisition(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="floor_requisitions"
    )
    item_type = models.CharField(max_length=100)
    quantity_requested = models.PositiveIntegerField()
    quantity_approved = models.PositiveIntegerField(null=True, blank=True)
    request_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"), ("issued", "Issued")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Floor Requisition"
        verbose_name_plural = "Floor Requisitions"

    def __str__(self):
        return f"{self.production_order.order_number} - {self.item_type}"
