from django.db import models
from django.conf import settings

class DefectCategory(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='defect_category_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    is_active = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'defect_category'
        verbose_name = 'DefectCategory'
        verbose_name_plural = 'DefectCategoies'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class EndLineQC(models.Model):
    production_order = models.IntegerField()
    check_date = models.DateField()
    checked_quantity = models.CharField()
    passed_quantity = models.CharField()
    failed_quantity = models.CharField()
    defect_category = models.IntegerField(null=True, blank=True)
    remarks = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('pass', 'Pass'), ('fail', 'Fail'), ('rework', 'Rework')])
    checked_by = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='end_line_qc_set',
    )

    class Meta:
        db_table = 'end_line_qc'
        verbose_name = 'EndLineQC'
        verbose_name_plural = 'EndLineQCs'


class FabricInspection(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='fabric_inspection_set',
    )
    fabric_received_from = models.CharField(max_length=255)
    supplier = models.CharField(max_length=255)
    inspection_date = models.DateField()
    total_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    inspected_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    passed_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    rejected_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    defect_category = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('passed', 'Passed'), ('failed', 'Failed'), ('conditional', 'Conditional')])
    notes = models.CharField(max_length=255)
    inspected_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'fabric_inspection'
        verbose_name = 'FabricInspection'
        verbose_name_plural = 'FabricInspections'


class FinalInspection(models.Model):
    production_order = models.IntegerField()
    inspection_date = models.DateField()
    inspected_quantity = models.CharField()
    passed_quantity = models.CharField()
    failed_quantity = models.CharField()
    aql_level = models.CharField(max_length=10)
    critical_defects = models.CharField()
    major_defects = models.CharField()
    minor_defects = models.CharField()
    status = models.CharField(max_length=50, choices=[('pass', 'Pass'), ('fail', 'Fail'), ('conditional', 'Conditional')])
    notes = models.CharField(max_length=255)
    inspected_by = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='final_inspection_set',
    )

    class Meta:
        db_table = 'final_inspection'
        verbose_name = 'FinalInspection'
        verbose_name_plural = 'FinalInspections'


class InlineQC(models.Model):
    production_order = models.IntegerField()
    production_line = models.CharField(max_length=100)
    check_date = models.DateField()
    checked_quantity = models.CharField()
    defect_quantity = models.CharField()
    defect_category = models.IntegerField(null=True, blank=True)
    defect_description = models.CharField(max_length=255)
    action_taken = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('pass', 'Pass'), ('fail', 'Fail'), ('rework', 'Rework')])
    checked_by = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='inline_qc_set',
    )

    class Meta:
        db_table = 'inline_qc'
        verbose_name = 'InlineQC'
        verbose_name_plural = 'InlineQCs'


class RejectionReport(models.Model):
    production_order = models.IntegerField()
    report_date = models.DateField()
    stage = models.CharField(max_length=50, choices=[('cutting', 'Cutting'), ('sewing', 'Sewing'), ('washing', 'Washing'), ('finishing', 'Finishing'), ('packing', 'Packing')])
    rejected_quantity = models.CharField()
    defect_category = models.IntegerField(null=True, blank=True)
    defect_details = models.CharField(max_length=255)
    corrective_action = models.CharField(max_length=255)
    reported_by = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='rejection_report_set',
    )

    class Meta:
        db_table = 'rejection_report'
        verbose_name = 'RejectionReport'
        verbose_name_plural = 'RejectionReports'

