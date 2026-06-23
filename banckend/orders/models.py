from django.db import models
from auditlog.registry import auditlog

class Buyer(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="buyers")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Season(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="seasons")
    name = models.CharField(max_length=100)  # AW24, SS24
    year = models.IntegerField()

    def __str__(self):
        return self.name

class Style(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="styles")
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, related_name="styles")
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="styles")
    code = models.CharField(max_length=100, unique=True)  # HM-A992
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

class PurchaseOrder(models.Model):
    STAGE_CHOICES = [
        ('po_received', 'PO Received'),
        ('fabric_sourcing', 'Fabric Sourcing'),
        ('production', 'Production'),
        ('shipping', 'Shipping'),
    ]
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="purchase_orders")
    po_number = models.CharField(max_length=100, unique=True)  # PO-84920
    style = models.ForeignKey(Style, on_delete=models.CASCADE, related_name="purchase_orders")
    qty = models.PositiveIntegerField()
    ship_date = models.DateField()
    current_stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='po_received')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.po_number

class OrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    color = models.CharField(max_length=100)
    size = models.CharField(max_length=50)
    qty = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.purchase_order.po_number} - {self.color} - {self.size}"

class OrderStageLog(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="stage_logs")
    stage = models.CharField(max_length=50)
    changed_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.purchase_order.po_number} -> {self.stage}"

class SampleDevelopment(models.Model):
    SAMPLE_TYPES = [
        ('proto', 'Proto/1st Fit'),
        ('size_set', 'PP/Size Set'),
        ('top', 'TOP/Shipping'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    style = models.ForeignKey(Style, on_delete=models.CASCADE, related_name="samples")
    sample_type = models.CharField(max_length=50, choices=SAMPLE_TYPES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    submission_date = models.DateField(null=True, blank=True)
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.style.code} - {self.sample_type}"

class BuyerRating(models.Model):
    buyer = models.OneToOneField(Buyer, on_delete=models.CASCADE, related_name="rating")
    rating = models.DecimalField(max_digits=3, decimal_places=2)  # 4.90
    reviews_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.buyer.name} - {self.rating}"

auditlog.register(Buyer)
auditlog.register(Season)
auditlog.register(Style)
auditlog.register(PurchaseOrder)
auditlog.register(OrderItem)
auditlog.register(OrderStageLog)
auditlog.register(SampleDevelopment)
auditlog.register(BuyerRating)
