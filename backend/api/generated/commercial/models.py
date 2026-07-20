from django.db import models
from django.conf import settings

class BillOfExchange(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='bill_of_exchange_set',
    )
    buyer = models.IntegerField()
    bill_number = models.CharField(max_length=100)
    issue_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('submitted', 'Submitted'), ('accepted', 'Accepted'), ('paid', 'Paid'), ('dishonored', 'Dishonored')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'bill_of_exchange'
        verbose_name = 'BillOfExchange'
        verbose_name_plural = 'BillOfExchanges'


class LC(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='lc_set',
    )
    buyer = models.IntegerField()
    purchase_order = models.IntegerField(null=True, blank=True)
    lc_number = models.CharField(max_length=100)
    lc_type = models.CharField(max_length=50, choices=[('export', 'Export'), ('import', 'Import'), ('btb', 'Btb')])
    issue_date = models.DateField()
    expiry_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.IntegerField(null=True, blank=True)
    issuing_bank = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('issued', 'Issued'), ('amended', 'Amended'), ('expired', 'Expired'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'lc'
        verbose_name = 'LC'
        verbose_name_plural = 'LCs'


class Shipment(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='shipment_set',
    )
    purchase_order = models.IntegerField()
    buyer = models.IntegerField()
    shipment_number = models.CharField(max_length=100)
    shipment_date = models.DateField()
    etd = models.DateField(null=True, blank=True)
    eta = models.DateField(null=True, blank=True)
    port_of_loading = models.CharField(max_length=255)
    port_of_discharge = models.CharField(max_length=255)
    forwarder = models.CharField(max_length=255)
    container_number = models.CharField(max_length=100)
    quantity = models.CharField()
    gross_weight = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('booked', 'Booked'), ('loaded', 'Loaded'), ('shipped', 'Shipped'), ('in_transit', 'In Transit'), ('arrived', 'Arrived'), ('delivered', 'Delivered')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'shipment'
        verbose_name = 'Shipment'
        verbose_name_plural = 'Shipments'

