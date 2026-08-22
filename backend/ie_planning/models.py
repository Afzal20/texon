from django.db import models
from merchandising.models import Style, PurchaseOrder


class CapacityBooking(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="capacity_bookings"
    )
    line = models.CharField(max_length=100)
    capacity_per_day = models.PositiveIntegerField()
    booking_date = models.DateField()
    allocated_days = models.PositiveIntegerField()
    status = models.CharField(
        max_length=50,
        choices=[("allocated", "Allocated"), ("in_use", "In Use"), ("released", "Released")],
        default="allocated",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "CapacityBooking"
        verbose_name_plural = "CapacityBookings"

    def __str__(self):
        return f"{self.style.style_number} - Line {self.line}"


class LinePlan(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="line_plans"
    )
    line = models.CharField(max_length=100)
    plan_date = models.DateField()
    target_quantity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=50,
        choices=[("planned", "Planned"), ("running", "Running"), ("completed", "Completed")],
        default="planned",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "LinePlan"
        verbose_name_plural = "LinePlans"

    def __str__(self):
        return f"{self.style.style_number} - {self.line} - {self.plan_date}"


class ProductionPlan(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="production_plans"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="production_plans"
    )
    planned_start_date = models.DateField()
    planned_end_date = models.DateField()
    daily_target = models.PositiveIntegerField()
    total_quantity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("approved", "Approved"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("on_hold", "On Hold"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ProductionPlan"
        verbose_name_plural = "ProductionPlans"

    def __str__(self):
        return f"{self.style.style_number} - {self.planned_start_date}"


class RiskAssessment(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="risk_assessments"
    )
    risk_type = models.CharField(max_length=100)
    severity = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High"), ("critical", "Critical")],
    )
    likelihood = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
    )
    mitigation_plan = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("open", "Open"), ("mitigated", "Mitigated"), ("closed", "Closed")],
        default="open",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "RiskAssessment"
        verbose_name_plural = "RiskAssessments"

    def __str__(self):
        return f"{self.style.style_number} - {self.risk_type}"


class StyleAnalysis(models.Model):
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="analyses"
    )
    analysis_type = models.CharField(
        max_length=50,
        choices=[
            ("cost", "Cost Analysis"),
            ("feasibility", "Feasibility Study"),
            ("market", "Market Analysis"),
            ("production", "Production Analysis"),
        ],
    )
    findings = models.TextField()
    recommendation = models.TextField(blank=True)
    analyzed_by = models.CharField(max_length=255)
    analysis_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "StyleAnalysis"
        verbose_name_plural = "StyleAnalysis"

    def __str__(self):
        return f"{self.style.style_number} - {self.analysis_type}"
