from django.db import models
from django.conf import settings

class Accessory(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='accessory_set',
    )
    warehouse = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    quantity = models.CharField()
    unit = models.CharField(max_length=20)
    threshold_quantity = models.CharField()
    unit_price = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'accessory'
        verbose_name = 'Accessory'
        verbose_name_plural = 'Accessoies'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class Fabric(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='fabric_set',
    )
    warehouse = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    color = models.CharField(max_length=100)
    composition = models.CharField(max_length=255)
    width = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    quantity = models.DecimalField(max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=20)
    threshold_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    unit_price = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'fabric'
        verbose_name = 'Fabric'
        verbose_name_plural = 'Fabrics'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class PhysicalInventory(models.Model):
    warehouse = models.IntegerField()
    inventory_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('verified', 'Verified')])
    notes = models.CharField(max_length=255)
    created_by = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='physical_inventory_set',
    )

    class Meta:
        db_table = 'physical_inventory'
        verbose_name = 'PhysicalInventory'
        verbose_name_plural = 'PhysicalInventoies'


class ShadeApproval(models.Model):
    fabric = models.IntegerField()
    shade_name = models.CharField(max_length=100)
    shade_code = models.CharField(max_length=50)
    approved_by = models.CharField(max_length=255)
    approval_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')])
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='shade_approval_set',
    )

    class Meta:
        db_table = 'shade_approval'
        verbose_name = 'ShadeApproval'
        verbose_name_plural = 'ShadeApprovals'


class StockMovement(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='stock_movement_set',
    )
    item_type = models.CharField(max_length=50, choices=[('fabric', 'Fabric'), ('accessory', 'Accessory'), ('trim', 'Trim')])
    item_id = models.CharField()
    from_warehouse = models.IntegerField(null=True, blank=True)
    to_warehouse = models.IntegerField(null=True, blank=True)
    movement_type = models.CharField(max_length=50, choices=[('in', 'In'), ('out', 'Out'), ('transfer', 'Transfer'), ('return', 'Return'), ('waste', 'Waste')])
    quantity = models.DecimalField(max_digits=15, decimal_places=2)
    reference_number = models.CharField(max_length=100)
    notes = models.CharField(max_length=255)
    created_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'stock_movement'
        verbose_name = 'StockMovement'
        verbose_name_plural = 'StockMovements'


class Trim(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='trim_set',
    )
    warehouse = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100)
    quantity = models.CharField()
    unit = models.CharField(max_length=20)
    threshold_quantity = models.CharField()
    unit_price = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'trim'
        verbose_name = 'Trim'
        verbose_name_plural = 'Trims'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class Warehouse(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='warehouse_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'warehouse'
        verbose_name = 'Warehouse'
        verbose_name_plural = 'Warehouses'
    def __str__(self):
        return str(getattr(self, 'name', ''))

