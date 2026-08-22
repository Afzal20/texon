from django.db import models
from merchandising.models import Style, PurchaseOrder


class ProductionUnit(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "ProductionUnit"
        verbose_name_plural = "ProductionUnits"

    def __str__(self):
        return self.name


class ProductionLine(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=255, blank=True)
    production_unit = models.ForeignKey(
        ProductionUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="lines"
    )
    capacity = models.PositiveIntegerField(help_text="Daily capacity in pieces")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ProductionLine"
        verbose_name_plural = "ProductionLines"
        unique_together = ("code",)
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class ProductionOrder(models.Model):
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
        verbose_name = "ProductionOrder"
        verbose_name_plural = "ProductionOrders"
        unique_together = ("order_number",)
        ordering = ["-created_at"]

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
        ordering = ["-id"]
        verbose_name = "CuttingRecord"
        verbose_name_plural = "CuttingRecords"

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
        verbose_name = "SewingRecord"
        verbose_name_plural = "SewingRecords"
        ordering = ["-date", "-id"]

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
        ordering = ["-id"]
        verbose_name = "InspectionPacking"
        verbose_name_plural = "InspectionPackings"

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
        ordering = ["-id"]
        verbose_name = "FloorRequisition"
        verbose_name_plural = "FloorRequisitions"

    def __str__(self):
        return f"{self.production_order.order_number} - {self.item_type}"


class LineCapacity(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="capacities"
    )
    date = models.DateField()
    daily_capacity_pcs = models.PositiveIntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "LineCapacity"
        verbose_name_plural = "LineCapacitys"

    def __str__(self):
        return f"{self.production_line.code} - {self.date} - {self.daily_capacity_pcs}"


class ProductionShift(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, null=True, blank=True, related_name="shifts"
    )
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "ProductionShift"
        verbose_name_plural = "ProductionShifts"

    def __str__(self):
        return f"{self.name} ({self.start_time}-{self.end_time})"


class ProductionRecord(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="production_records"
    )
    date = models.DateField()
    output_quantity = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "ProductionRecord"
        verbose_name_plural = "ProductionRecords"

    def __str__(self):
        return f"{self.production_line.code} - {self.date} - {self.output_quantity}"


class OEELog(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="oee_logs"
    )
    timestamp = models.DateTimeField()
    availability_rate = models.DecimalField(max_digits=5, decimal_places=2)
    performance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    quality_rate = models.DecimalField(max_digits=5, decimal_places=2)
    oee_score = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        ordering = ["-id"]
        verbose_name = "OEELog"
        verbose_name_plural = "OEELogs"

    def __str__(self):
        return f"{self.production_line.code} - OEE {self.oee_score}%"


class DefectLog(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="defect_logs"
    )
    date = models.DateField()
    defect_type = models.CharField(max_length=100, blank=True)
    checked_quantity = models.PositiveIntegerField()
    defect_quantity = models.PositiveIntegerField()
    defect_rate = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "DefectLog"
        verbose_name_plural = "DefectLogs"

    def __str__(self):
        return f"{self.production_line.code} - {self.date} - {self.defect_quantity} defects"


class HeatmapData(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="heatmap_data"
    )
    metric = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "HeatmapData"
        verbose_name_plural = "HeatmapDatas"

    def __str__(self):
        return f"{self.production_line.code} - {self.metric} = {self.value}"


class BottleneckAlert(models.Model):
    production_line = models.ForeignKey(
        ProductionLine, on_delete=models.CASCADE, related_name="bottleneck_alerts"
    )
    alert_message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "BottleneckAlert"
        verbose_name_plural = "BottleneckAlerts"

    def __str__(self):
        return f"{self.production_line.code} - {self.alert_message[:50]}"
