from django.db import models
from buyers.models import Buyer


class Season(models.Model):
    name = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Season"
        verbose_name_plural = "Seasons"
        unique_together = ("name", "year")

    def __str__(self):
        return f"{self.name} {self.year}"


class Style(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="styles"
    )
    season = models.ForeignKey(
        Season, on_delete=models.SET_NULL, null=True, blank=True, related_name="styles"
    )
    name = models.CharField(max_length=255)
    style_number = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Style"
        verbose_name_plural = "Styles"
        unique_together = ("style_number",)

    def __str__(self):
        return f"{self.style_number} - {self.name}"


class BuyerEnquiry(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="enquiries"
    )
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="enquiries"
    )
    enquiry_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("received", "Received"),
            ("under_review", "Under Review"),
            ("quoted", "Quoted"),
            ("converted", "Converted to Order"),
            ("lost", "Lost"),
        ],
        default="received",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Buyer Enquiry"
        verbose_name_plural = "Buyer Enquiries"

    def __str__(self):
        return f"Enquiry from {self.buyer.name} on {self.enquiry_date}"


class PurchaseOrder(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    po_number = models.CharField(max_length=100)
    order_date = models.DateField()
    delivery_date = models.DateField()
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("confirmed", "Confirmed"),
            ("in_production", "In Production"),
            ("shipped", "Shipped"),
            ("delivered", "Delivered"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"
        unique_together = ("po_number",)

    def __str__(self):
        return f"PO {self.po_number} - {self.buyer.name}"


class OrderItem(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="items"
    )
    color = models.CharField(max_length=100)
    size = models.CharField(max_length=50)
    qty = models.PositiveIntegerField()

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.purchase_order.po_number} - {self.color}/{self.size} x {self.qty}"


class OrderStageLog(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="stage_logs"
    )
    stage = models.CharField(max_length=50)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Order Stage Log"
        verbose_name_plural = "Order Stage Logs"

    def __str__(self):
        return f"{self.purchase_order.po_number} -> {self.stage}"


class SampleOrder(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="sample_orders"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="sample_orders"
    )
    sample_type = models.CharField(
        max_length=50,
        choices=[
            ("fit", "Fit Sample"),
            ("pp", "PP Sample"),
            ("size_set", "Size Set"),
            ("pre_production", "Pre-Production"),
            ("photo", "Photo Sample"),
            ("shipping", "Shipping Sample"),
        ],
    )
    quantity = models.PositiveIntegerField()
    request_date = models.DateField()
    deadline = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("requested", "Requested"),
            ("in_progress", "In Progress"),
            ("submitted", "Submitted"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="requested",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sample Order"
        verbose_name_plural = "Sample Orders"

    def __str__(self):
        return f"{self.sample_type} - {self.style.style_number}"


class SMVRecord(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="smv_records"
    )
    smv = models.DecimalField(max_digits=8, decimal_places=2)
    calculated_by = models.CharField(max_length=255)
    calculation_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "SMV Record"
        verbose_name_plural = "SMV Records"

    def __str__(self):
        return f"{self.style.style_number}: {self.smv} SMV"


class DevelopmentMonitoring(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="development_monitoring"
    )
    supplier = models.CharField(max_length=255)
    stage = models.CharField(max_length=100)
    start_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("in_progress", "In Progress"), ("completed", "Completed")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Development Monitoring"
        verbose_name_plural = "Development Monitoring"

    def __str__(self):
        return f"{self.style.style_number} - {self.stage}"


class BudgetDemandAssessment(models.Model):
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="budget_demand_assessments"
    )
    assessment_date = models.DateField()
    forecast_quantity = models.PositiveIntegerField()
    booked_quantity = models.PositiveIntegerField(default=0)
    gap_quantity = models.PositiveIntegerField(default=0)
    revenue_estimate = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    confidence = models.CharField(
        max_length=20,
        choices=[("high", "High"), ("medium", "Medium"), ("low", "Low")],
        default="medium",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Budget Demand Assessment"
        verbose_name_plural = "Budget Demand Assessments"

    def __str__(self):
        return f"{self.buyer.name} - {self.assessment_date}"


class IeSuggestion(models.Model):
    production_line = models.ForeignKey(
        "production.ProductionLine", on_delete=models.SET_NULL, null=True, blank=True, related_name="ie_suggestions"
    )
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="ie_suggestions"
    )
    operation = models.CharField(max_length=255)
    current_pph = models.DecimalField(max_digits=8, decimal_places=2)
    target_pph = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("under_review", "Under Review"),
            ("implemented", "Implemented"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "IE Suggestion"
        verbose_name_plural = "IE Suggestions"

    def __str__(self):
        return f"IE-{self.id} - {self.operation}"


class SkillInventory(models.Model):
    employee = models.ForeignKey(
        "hr.Employee", on_delete=models.SET_NULL, null=True, blank=True, related_name="skill_inventories"
    )
    operator_name = models.CharField(max_length=255, blank=True)
    production_line = models.ForeignKey(
        "production.ProductionLine", on_delete=models.SET_NULL, null=True, blank=True, related_name="skill_inventories"
    )
    skill_name = models.CharField(max_length=255)
    skill_level = models.CharField(
        max_length=20,
        choices=[("beginner", "Beginner"), ("intermediate", "Intermediate"), ("expert", "Expert")],
        default="beginner",
    )
    multi_skill = models.BooleanField(default=False)
    last_assessed = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Skill Inventory"
        verbose_name_plural = "Skill Inventories"

    def __str__(self):
        name = self.operator_name or str(self.employee) or f"Operator #{self.id}"
        return f"{name} - {self.skill_name}"


class ProductionDowntime(models.Model):
    production_line = models.ForeignKey(
        "production.ProductionLine", on_delete=models.SET_NULL, null=True, blank=True, related_name="downtimes"
    )
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="downtimes"
    )
    start_datetime = models.DateTimeField()
    duration_hours = models.DecimalField(max_digits=8, decimal_places=2)
    cause = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[("ongoing", "Ongoing"), ("resolved", "Resolved")],
        default="ongoing",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Production Downtime"
        verbose_name_plural = "Production Downtimes"

    def __str__(self):
        return f"DT-{self.id} - {self.cause}"


class ProcessWiseTarget(models.Model):
    process_name = models.CharField(max_length=255)
    target_quantity = models.PositiveIntegerField()
    achieved_quantity = models.PositiveIntegerField(default=0)
    variance = models.IntegerField(default=0)
    target_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=[("exceeded", "Exceeded"), ("on_track", "On Track"), ("behind", "Behind")],
        default="on_track",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Process Wise Target"
        verbose_name_plural = "Process Wise Targets"

    def __str__(self):
        return f"{self.process_name} - {self.target_date}"
