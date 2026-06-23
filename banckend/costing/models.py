from django.db import models
from auditlog.registry import auditlog

class BOMCategory(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="bom_categories")
    name = models.CharField(max_length=100)  # Fabric, Trims, Labor
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class SupplierQuote(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="supplier_quotes")
    supplier_name = models.CharField(max_length=255)  # Coats PLC
    item_description = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=4)
    currency = models.CharField(max_length=10, default="USD")
    valid_until = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.supplier_name} - {self.item_description} ({self.unit_price})"

class BillOfMaterials(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="boms")
    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE, related_name="boms")
    style_code = models.CharField(max_length=100)
    version = models.IntegerField(default=1)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"BOM {self.style_code} (v{self.version})"

class BOMItem(models.Model):
    bill_of_materials = models.ForeignKey(BillOfMaterials, on_delete=models.CASCADE, related_name="items")
    category = models.ForeignKey(BOMCategory, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    required_qty = models.DecimalField(max_digits=12, decimal_places=4)
    unit_price = models.DecimalField(max_digits=10, decimal_places=4)
    wastage_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    @property
    def total_cost(self):
        qty_with_waste = self.required_qty * (1 + self.wastage_percentage / 100)
        return qty_with_waste * self.unit_price

    def __str__(self):
        return f"{self.description} ({self.category.name})"

class CostRevision(models.Model):
    bill_of_materials = models.ForeignKey(BillOfMaterials, on_delete=models.CASCADE, related_name="revisions")
    revised_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True)
    revision_date = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()

    def __str__(self):
        return f"Rev {self.bill_of_materials.style_code} on {self.revision_date}"

class ApprovalWorkflow(models.Model):
    bill_of_materials = models.ForeignKey(BillOfMaterials, on_delete=models.CASCADE, related_name="approvals")
    approver = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name="bom_approvals")
    status = models.CharField(max_length=50, default="pending")  # pending, approved, rejected
    comments = models.TextField(blank=True, null=True)
    actioned_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Approval for {self.bill_of_materials} by {self.approver.email}"

auditlog.register(BOMCategory)
auditlog.register(SupplierQuote)
auditlog.register(BillOfMaterials)
auditlog.register(BOMItem)
auditlog.register(CostRevision)
auditlog.register(ApprovalWorkflow)
