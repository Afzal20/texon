from django.db import models
from django.conf import settings

class CuttingRecord(models.Model):
    production_order = models.IntegerField()
    date = models.DateField()
    quantity_cut = models.CharField()
    fabric_used = models.DecimalField(max_digits=15, decimal_places=2)
    waste_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='cutting_record_set',
    )

    class Meta:
        db_table = 'cutting_record'
        verbose_name = 'CuttingRecord'
        verbose_name_plural = 'CuttingRecords'


class FloorRequisition(models.Model):
    production_order = models.IntegerField()
    item_type = models.CharField(max_length=100)
    quantity_requested = models.CharField()
    quantity_approved = models.CharField(null=True, blank=True)
    request_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('issued', 'Issued')])
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='floor_requisition_set',
    )

    class Meta:
        db_table = 'floor_requisition'
        verbose_name = 'FloorRequisition'
        verbose_name_plural = 'FloorRequisitions'


class InspectionPacking(models.Model):
    production_order = models.IntegerField()
    date = models.DateField()
    inspected_quantity = models.CharField()
    passed_quantity = models.CharField()
    failed_quantity = models.CharField()
    packed_quantity = models.CharField()
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='inspection_packing_set',
    )

    class Meta:
        db_table = 'inspection_packing'
        verbose_name = 'InspectionPacking'
        verbose_name_plural = 'InspectionPackings'


class ProductionLine(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='production_line_set',
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    capacity = models.CharField()
    is_active = models.BooleanField()

    class Meta:
        db_table = 'production_line'
        verbose_name = 'ProductionLine'
        verbose_name_plural = 'ProductionLines'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class ProductionOrder(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='production_order_set',
    )
    purchase_order = models.IntegerField()
    style = models.IntegerField()
    production_line = models.IntegerField(null=True, blank=True)
    order_number = models.CharField(max_length=100)
    quantity = models.CharField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('released', 'Released'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('on_hold', 'On Hold'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'production_order'
        verbose_name = 'ProductionOrder'
        verbose_name_plural = 'ProductionOrders'


class SewingRecord(models.Model):
    production_order = models.IntegerField()
    production_line = models.IntegerField(null=True, blank=True)
    date = models.DateField()
    input_quantity = models.CharField()
    output_quantity = models.CharField()
    defect_quantity = models.CharField()
    efficiency = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='sewing_record_set',
    )

    class Meta:
        db_table = 'sewing_record'
        verbose_name = 'SewingRecord'
        verbose_name_plural = 'SewingRecords'

