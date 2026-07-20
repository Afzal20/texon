from django.db import models
from django.conf import settings

class PurchaseOrder(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='purchase_order_set',
    )
    buyer = models.IntegerField()
    style = models.IntegerField()
    po_number = models.CharField(max_length=100)
    order_date = models.DateField()
    delivery_date = models.DateField()
    quantity = models.CharField()
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('confirmed', 'Confirmed'), ('in_production', 'In Production'), ('shipped', 'Shipped'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'purchase_order'
        verbose_name = 'PurchaseOrder'
        verbose_name_plural = 'PurchaseOrders'


class QuotationAnalysis(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='quotation_analysis_set',
    )
    supplier = models.IntegerField()
    item_type = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=15, decimal_places=2)
    quoted_price = models.DecimalField(max_digits=15, decimal_places=2)
    delivery_terms = models.CharField(max_length=255)
    payment_terms = models.CharField(max_length=255)
    validity_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('negotiating', 'Negotiating')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'quotation_analysis'
        verbose_name = 'QuotationAnalysis'
        verbose_name_plural = 'QuotationAnalysiss'


class RawMaterialBooking(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='raw_material_booking_set',
    )
    supplier = models.IntegerField()
    booking_number = models.CharField(max_length=100)
    booking_date = models.DateField()
    expected_delivery_date = models.DateField()
    item_type = models.CharField(max_length=50, choices=[('fabric', 'Fabric'), ('accessory', 'Accessory'), ('trim', 'Trim')])
    item_id = models.CharField()
    quantity = models.DecimalField(max_digits=15, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('confirmed', 'Confirmed'), ('partial_received', 'Partial Received'), ('received', 'Received'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'raw_material_booking'
        verbose_name = 'RawMaterialBooking'
        verbose_name_plural = 'RawMaterialBookings'


class RawMaterialRequisition(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='raw_material_requisition_set',
    )
    requisition_number = models.CharField(max_length=100)
    item_type = models.CharField(max_length=50, choices=[('fabric', 'Fabric'), ('accessory', 'Accessory'), ('trim', 'Trim')])
    item_id = models.CharField()
    quantity = models.DecimalField(max_digits=15, decimal_places=2)
    required_date = models.DateField()
    purpose = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('pending_approval', 'Pending Approval'), ('approved', 'Approved'), ('ordered', 'Ordered'), ('received', 'Received'), ('cancelled', 'Cancelled')])
    requested_by = models.CharField(max_length=255)
    approved_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'raw_material_requisition'
        verbose_name = 'RawMaterialRequisition'
        verbose_name_plural = 'RawMaterialRequisitions'


class Supplier(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='supplier_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    contact_person = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    supplier_type = models.CharField(max_length=50, choices=[('fabric', 'Fabric'), ('accessory', 'Accessory'), ('trim', 'Trim'), ('general', 'General')])
    rating = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=2)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'supplier'
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
    def __str__(self):
        return str(getattr(self, 'name', ''))

