from django.db import models
from auditlog.registry import auditlog

class Warehouse(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="warehouses")
    name = models.CharField(max_length=255)  # Zone A (Fabric)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class WarehouseZone(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="zones")
    code = models.CharField(max_length=50)  # A1, A2

    def __str__(self):
        return f"{self.warehouse.name} - {self.code}"

class InventoryItem(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="inventory_items")
    sku = models.CharField(max_length=100, unique=True)  # SKU-level
    name = models.CharField(max_length=255)  # Denim Twill 12oz
    description = models.TextField(blank=True, null=True)
    unit_of_measure = models.CharField(max_length=50, default="pcs")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sku} - {self.name}"

class FabricRoll(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="fabric_rolls")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="fabric_rolls")
    batch_no = models.CharField(max_length=100, unique=True)  # Batch BCH-8821-A
    length_yards = models.DecimalField(max_digits=8, decimal_places=2)
    warehouse_zone = models.ForeignKey(WarehouseZone, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Roll: {self.batch_no}"

class StockTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('receive', 'Receive'),
        ('issue', 'Issue'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Adjustment'),
    ]
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="stock_transactions")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    from_zone = models.ForeignKey(WarehouseZone, on_delete=models.SET_NULL, null=True, blank=True, related_name="outgoing_transactions")
    to_zone = models.ForeignKey(WarehouseZone, on_delete=models.SET_NULL, null=True, blank=True, related_name="incoming_transactions")
    performed_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type.upper()} - {self.inventory_item.sku} ({self.quantity})"

class StockLevel(models.Model):
    warehouse_zone = models.ForeignKey(WarehouseZone, on_delete=models.CASCADE, related_name="stock_levels")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="stock_levels")
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('warehouse_zone', 'inventory_item')

    def __str__(self):
        return f"{self.inventory_item.sku} in {self.warehouse_zone.code}: {self.current_stock}"

class Requisition(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('issued', 'Issued'),
        ('rejected', 'Rejected'),
    ]
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="requisitions")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="requisitions")
    quantity_requested = models.DecimalField(max_digits=12, decimal_places=2)
    requested_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, related_name="requisitions_created")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Req: {self.inventory_item.sku} - {self.quantity_requested}"

class DeadstockAlert(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="deadstock_alerts")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="deadstock_alerts")
    risk_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    alert_message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Deadstock risk for {self.inventory_item.sku}: {self.risk_percentage}%"

class ReorderPrediction(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="reorder_predictions")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="reorder_predictions")
    recommended_qty = models.DecimalField(max_digits=12, decimal_places=2)
    prediction_confidence = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reorder: {self.inventory_item.sku} ({self.recommended_qty})"

auditlog.register(Warehouse)
auditlog.register(WarehouseZone)
auditlog.register(InventoryItem)
auditlog.register(FabricRoll)
auditlog.register(StockTransaction)
auditlog.register(StockLevel)
auditlog.register(Requisition)
auditlog.register(DeadstockAlert)
auditlog.register(ReorderPrediction)
