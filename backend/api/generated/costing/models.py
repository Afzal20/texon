from django.db import models
from django.conf import settings

class CostSheet(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='cost_sheet_set',
    )
    style = models.IntegerField()
    cost_date = models.DateField()
    fabric_cost = models.DecimalField(max_digits=15, decimal_places=2)
    accessory_cost = models.DecimalField(max_digits=15, decimal_places=2)
    trim_cost = models.DecimalField(max_digits=15, decimal_places=2)
    labor_cost = models.DecimalField(max_digits=15, decimal_places=2)
    overhead_cost = models.DecimalField(max_digits=15, decimal_places=2)
    commercial_cost = models.DecimalField(max_digits=15, decimal_places=2)
    total_cost = models.DecimalField(max_digits=15, decimal_places=2)
    selling_price = models.DecimalField(max_digits=15, decimal_places=2)
    margin = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('final', 'Final'), ('revised', 'Revised')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'cost_sheet'
        verbose_name = 'CostSheet'
        verbose_name_plural = 'CostSheets'


class PreCosting(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='pre_costing_set',
    )
    buyer = models.IntegerField()
    style = models.IntegerField()
    cost_date = models.DateField()
    estimated_fabric_cost = models.DecimalField(max_digits=15, decimal_places=2)
    estimated_accessory_cost = models.DecimalField(max_digits=15, decimal_places=2)
    estimated_trim_cost = models.DecimalField(max_digits=15, decimal_places=2)
    estimated_labor_cost = models.DecimalField(max_digits=15, decimal_places=2)
    estimated_overhead = models.DecimalField(max_digits=15, decimal_places=2)
    total_estimated_cost = models.DecimalField(max_digits=15, decimal_places=2)
    target_price = models.DecimalField(max_digits=15, decimal_places=2)
    expected_margin = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('approved', 'Approved'), ('revised', 'Revised')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'pre_costing'
        verbose_name = 'PreCosting'
        verbose_name_plural = 'PreCostings'


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

