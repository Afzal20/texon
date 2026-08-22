from django.db import models


class Warehouse(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Warehouse"
        verbose_name_plural = "Warehouses"
        unique_together = ("code",)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Fabric(models.Model):
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name="fabrics"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    color = models.CharField(max_length=100, blank=True)
    composition = models.CharField(max_length=255, blank=True)
    width = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, default="meters")
    threshold_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Fabric"
        verbose_name_plural = "Fabrics"
        unique_together = ("code",)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Accessory(models.Model):
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name="accessories"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=20, default="pcs")
    threshold_quantity = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Accessory"
        verbose_name_plural = "Accessorys"
        unique_together = ("code",)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Trim(models.Model):
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name="trims"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=20, default="pcs")
    threshold_quantity = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Trim"
        verbose_name_plural = "Trims"
        unique_together = ("code",)

    def __str__(self):
        return f"{self.name} ({self.code})"


class StockMovement(models.Model):
    item_type = models.CharField(
        max_length=20,
        choices=[("fabric", "Fabric"), ("accessory", "Accessory"), ("trim", "Trim")],
    )
    item_id = models.PositiveIntegerField()
    from_warehouse = models.ForeignKey(
        Warehouse, on_delete=models.SET_NULL, null=True, related_name="outgoing_movements"
    )
    to_warehouse = models.ForeignKey(
        Warehouse, on_delete=models.SET_NULL, null=True, related_name="incoming_movements"
    )
    movement_type = models.CharField(
        max_length=50,
        choices=[
            ("in", "Stock In"),
            ("out", "Stock Out"),
            ("transfer", "Transfer"),
            ("return", "Return to Supplier"),
            ("waste", "Waste"),
        ],
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "StockMovement"
        verbose_name_plural = "StockMovements"

    def __str__(self):
        return f"{self.movement_type} - {self.item_type} #{self.item_id}"


class ShadeApproval(models.Model):
    fabric = models.ForeignKey(
        Fabric, on_delete=models.CASCADE, related_name="shade_approvals"
    )
    shade_name = models.CharField(max_length=100)
    shade_code = models.CharField(max_length=50)
    approved_by = models.CharField(max_length=255)
    approval_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "ShadeApproval"
        verbose_name_plural = "ShadeApprovals"

    def __str__(self):
        return f"{self.fabric.name} - {self.shade_name}"


class PhysicalInventory(models.Model):
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name="physical_inventories"
    )
    inventory_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[("draft", "Draft"), ("in_progress", "In Progress"), ("completed", "Completed"), ("verified", "Verified")],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "PhysicalInventory"
        verbose_name_plural = "PhysicalInventorys"

    def __str__(self):
        return f"{self.warehouse.name} - {self.inventory_date}"
