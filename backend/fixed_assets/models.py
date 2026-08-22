from django.db import models
from core.models import Location


class AssetCategory(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    depreciation_method = models.CharField(
        max_length=50,
        choices=[
            ("straight_line", "Straight Line"),
            ("declining", "Declining Balance"),
            ("sum_of_years", "Sum of Years Digits"),
            ("units_of_production", "Units of Production"),
        ],
        default="straight_line",
    )
    useful_life_years = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "AssetCategory"
        verbose_name_plural = "AssetCategorys"
        unique_together = ("code",)

    def __str__(self):
        return self.name


class FixedAsset(models.Model):
    category = models.ForeignKey(
        AssetCategory, on_delete=models.CASCADE, related_name="assets"
    )
    location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="fixed_assets"
    )
    asset_code = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=15, decimal_places=2)
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    depreciation_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(
        max_length=50,
        choices=[
            ("active", "Active"),
            ("disposed", "Disposed"),
            ("under_maintenance", "Under Maintenance"),
            ("sold", "Sold"),
        ],
        default="active",
    )
    assigned_to = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "FixedAsset"
        verbose_name_plural = "FixedAssets"
        unique_together = ("asset_code",)

    def __str__(self):
        return f"{self.asset_code} - {self.name}"


class DepreciationSchedule(models.Model):
    fixed_asset = models.ForeignKey(
        FixedAsset, on_delete=models.CASCADE, related_name="depreciation_schedules"
    )
    year = models.PositiveIntegerField()
    period = models.CharField(max_length=20, help_text="e.g., 2024-Q1 or 2024")
    opening_value = models.DecimalField(max_digits=15, decimal_places=2)
    depreciation = models.DecimalField(max_digits=15, decimal_places=2)
    closing_value = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "DepreciationSchedule"
        verbose_name_plural = "DepreciationSchedules"

    def __str__(self):
        return f"{self.fixed_asset.asset_code} - {self.period}"
