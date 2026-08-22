from django.db import models
from merchandising.models import Style
from production.models import ProductionOrder


class DefectCategory(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "DefectCategory"
        verbose_name_plural = "DefectCategorys"
        unique_together = ("code",)

    def __str__(self):
        return self.name


class FabricInspection(models.Model):
    fabric_received_from = models.CharField(max_length=255)
    supplier = models.CharField(max_length=255, blank=True)
    inspection_date = models.DateField()
    total_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    inspected_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    passed_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    rejected_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    defect_category = models.ForeignKey(
        DefectCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("passed", "Passed"), ("failed", "Failed"), ("conditional", "Conditional Pass")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    inspected_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "FabricInspection"
        verbose_name_plural = "FabricInspections"

    def __str__(self):
        return f"Fabric Inspection - {self.inspection_date}"


class InlineQC(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="inline_qc_records"
    )
    production_line = models.CharField(max_length=100)
    check_date = models.DateField()
    checked_quantity = models.PositiveIntegerField()
    defect_quantity = models.PositiveIntegerField(default=0)
    defect_category = models.ForeignKey(
        DefectCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    defect_description = models.TextField(blank=True)
    action_taken = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("pass", "Pass"), ("fail", "Fail"), ("rework", "Rework")],
        default="pass",
    )
    checked_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "InlineQC"
        verbose_name_plural = "InlineQCs"

    def __str__(self):
        return f"Inline QC - {self.production_order.order_number} - {self.check_date}"


class EndLineQC(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="endline_qc_records"
    )
    check_date = models.DateField()
    checked_quantity = models.PositiveIntegerField()
    passed_quantity = models.PositiveIntegerField()
    failed_quantity = models.PositiveIntegerField(default=0)
    defect_category = models.ForeignKey(
        DefectCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    remarks = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("pass", "Pass"), ("fail", "Fail"), ("rework", "Rework")],
        default="pass",
    )
    checked_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "EndLineQC"
        verbose_name_plural = "EndLineQCs"

    def __str__(self):
        return f"End Line QC - {self.production_order.order_number} - {self.check_date}"


class RejectionReport(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="rejection_reports"
    )
    report_date = models.DateField()
    stage = models.CharField(
        max_length=50,
        choices=[
            ("cutting", "Cutting"),
            ("sewing", "Sewing"),
            ("washing", "Washing"),
            ("finishing", "Finishing"),
            ("packing", "Packing"),
        ],
    )
    rejected_quantity = models.PositiveIntegerField()
    defect_category = models.ForeignKey(
        DefectCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    defect_details = models.TextField()
    corrective_action = models.TextField(blank=True)
    reported_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "RejectionReport"
        verbose_name_plural = "RejectionReports"

    def __str__(self):
        return f"Rejection - {self.production_order.order_number} - {self.stage}"


class FinalInspection(models.Model):
    production_order = models.ForeignKey(
        ProductionOrder, on_delete=models.CASCADE, related_name="final_inspections"
    )
    inspection_date = models.DateField()
    inspected_quantity = models.PositiveIntegerField()
    passed_quantity = models.PositiveIntegerField()
    failed_quantity = models.PositiveIntegerField(default=0)
    aql_level = models.CharField(max_length=10, blank=True)
    critical_defects = models.PositiveIntegerField(default=0)
    major_defects = models.PositiveIntegerField(default=0)
    minor_defects = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=50,
        choices=[("pass", "Pass"), ("fail", "Fail"), ("conditional", "Conditional Pass")],
        default="pass",
    )
    notes = models.TextField(blank=True)
    inspected_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "FinalInspection"
        verbose_name_plural = "FinalInspections"

    def __str__(self):
        return f"Final Inspection - {self.production_order.order_number} - {self.inspection_date}"
