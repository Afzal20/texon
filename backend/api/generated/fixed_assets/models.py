from django.db import models
from django.conf import settings

class AssetCategory(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='asset_category_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    depreciation_method = models.CharField(max_length=50, choices=[('straight_line', 'Straight Line'), ('declining', 'Declining'), ('sum_of_years', 'Sum Of Years'), ('units_of_production', 'Units Of Production')])
    useful_life_years = models.CharField()
    is_active = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'asset_category'
        verbose_name = 'AssetCategory'
        verbose_name_plural = 'AssetCategoies'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class DepreciationSchedule(models.Model):
    fixed_asset = models.IntegerField()
    year = models.CharField()
    period = models.CharField(max_length=20)
    opening_value = models.DecimalField(max_digits=15, decimal_places=2)
    depreciation = models.DecimalField(max_digits=15, decimal_places=2)
    closing_value = models.DecimalField(max_digits=15, decimal_places=2)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='depreciation_schedule_set',
    )

    class Meta:
        db_table = 'depreciation_schedule'
        verbose_name = 'DepreciationSchedule'
        verbose_name_plural = 'DepreciationSchedules'


class FixedAsset(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='fixed_asset_set',
    )
    category = models.IntegerField()
    location = models.IntegerField(null=True, blank=True)
    asset_code = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=15, decimal_places=2)
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2)
    depreciation_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('active', 'Active'), ('disposed', 'Disposed'), ('under_maintenance', 'Under Maintenance'), ('sold', 'Sold')])
    assigned_to = models.CharField(max_length=255)
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'fixed_asset'
        verbose_name = 'FixedAsset'
        verbose_name_plural = 'FixedAssets'
    def __str__(self):
        return str(getattr(self, 'name', ''))

