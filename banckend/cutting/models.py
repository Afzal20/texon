from django.db import models
from auditlog.registry import auditlog

class CuttingMachine(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="cutting_machines")
    name = models.CharField(max_length=255)  # Auto-Cutter A1
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class CuttingOrder(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="cutting_orders")
    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE, related_name="cutting_orders")
    order_no = models.CharField(max_length=100, unique=True)  # Marker RMG-4402
    target_qty = models.PositiveIntegerField()
    status = models.CharField(max_length=50, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.order_no

class Marker(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="markers")
    cutting_order = models.ForeignKey(CuttingOrder, on_delete=models.CASCADE, related_name="markers")
    name = models.CharField(max_length=100)  # P-01
    width_inches = models.DecimalField(max_digits=6, decimal_places=2)
    length_yards = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.cutting_order.order_no} - {self.name}"

class NestingPlan(models.Model):
    marker = models.OneToOneField(Marker, on_delete=models.CASCADE, related_name="nesting_plan")
    layout_data = models.JSONField()  # Store SVG/JSON layout data
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Nesting Plan for {self.marker.name}"

class PatternPiece(models.Model):
    marker = models.ForeignKey(Marker, on_delete=models.CASCADE, related_name="pieces")
    piece_name = models.CharField(max_length=100)
    geometry = models.JSONField()  # Store pattern piece geometry (SVG/JSON)

    def __str__(self):
        return f"{self.piece_name} in {self.marker.name}"

class NestingResult(models.Model):
    nesting_plan = models.OneToOneField(NestingPlan, on_delete=models.CASCADE, related_name="result")
    utilization_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    waste_area_sq_yards = models.DecimalField(max_digits=6, decimal_places=2)
    piece_count = models.PositiveIntegerField()

    def __str__(self):
        return f"Result: {self.utilization_percentage}% utilization"

class CuttingQueue(models.Model):
    cutting_order = models.OneToOneField(CuttingOrder, on_delete=models.CASCADE, related_name="queue_entry")
    cutting_machine = models.ForeignKey(CuttingMachine, on_delete=models.SET_NULL, null=True, blank=True)
    priority = models.IntegerField(default=0)
    assigned_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Queue entry: {self.cutting_order.order_no}"

auditlog.register(CuttingMachine)
auditlog.register(CuttingOrder)
auditlog.register(Marker)
auditlog.register(NestingPlan)
auditlog.register(PatternPiece)
auditlog.register(NestingResult)
auditlog.register(CuttingQueue)
