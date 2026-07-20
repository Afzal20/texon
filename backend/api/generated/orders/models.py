from django.db import models
from django.conf import settings

class JobOrder(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='job_order_set',
    )
    task = models.IntegerField()
    job_order_number = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    assigned_department = models.CharField(max_length=255)
    assigned_person = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('delayed', 'Delayed')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'job_order'
        verbose_name = 'JobOrder'
        verbose_name_plural = 'JobOrders'
    def __str__(self):
        return str(getattr(self, 'description', ''))


class Order(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='order_set',
    )
    buyer = models.IntegerField()
    style = models.IntegerField()
    order_number = models.CharField(max_length=100)
    order_date = models.DateField()
    delivery_date = models.DateField()
    quantity = models.CharField()
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('in_production', 'In Production'), ('shipped', 'Shipped'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')])
    priority = models.CharField(max_length=50, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'order'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'


class SampleOrder(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='sample_order_set',
    )
    buyer = models.IntegerField()
    style = models.IntegerField()
    sample_type = models.CharField(max_length=50, choices=[('fit', 'Fit'), ('pp', 'Pp'), ('size_set', 'Size Set'), ('pre_production', 'Pre Production'), ('photo', 'Photo'), ('shipping', 'Shipping')])
    quantity = models.CharField()
    request_date = models.DateField()
    deadline = models.DateField()
    status = models.CharField(max_length=50, choices=[('requested', 'Requested'), ('in_progress', 'In Progress'), ('submitted', 'Submitted'), ('approved', 'Approved'), ('rejected', 'Rejected')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'sample_order'
        verbose_name = 'SampleOrder'
        verbose_name_plural = 'SampleOrders'

