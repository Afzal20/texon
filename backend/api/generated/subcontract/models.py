from django.db import models
from django.conf import settings

class SubcontractOrder(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='subcontract_order_set',
    )
    style = models.IntegerField()
    purchase_order = models.IntegerField(null=True, blank=True)
    order_number = models.CharField(max_length=100)
    subcontractor_name = models.CharField(max_length=255)
    process = models.CharField(max_length=50, choices=[('cutting', 'Cutting'), ('sewing', 'Sewing'), ('washing', 'Washing'), ('embroidery', 'Embroidery'), ('printing', 'Printing'), ('finishing', 'Finishing'), ('packing', 'Packing')])
    quantity = models.CharField()
    rate = models.DecimalField(max_digits=15, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    start_date = models.DateField()
    expected_completion = models.DateField()
    actual_completion = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('delayed', 'Delayed'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'subcontract_order'
        verbose_name = 'SubcontractOrder'
        verbose_name_plural = 'SubcontractOrders'


class SubcontractTracking(models.Model):
    subcontract_order = models.IntegerField()
    tracking_date = models.DateField()
    quantity_received = models.CharField()
    quantity_passed = models.CharField()
    quantity_rejected = models.CharField()
    status = models.CharField(max_length=100)
    remarks = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='subcontract_tracking_set',
    )

    class Meta:
        db_table = 'subcontract_tracking'
        verbose_name = 'SubcontractTracking'
        verbose_name_plural = 'SubcontractTrackings'

