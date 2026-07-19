from django.contrib import admin

from .models import AssetCategory, DepreciationSchedule, FixedAsset


class DepreciationScheduleInline(admin.TabularInline):
    model = DepreciationSchedule


@admin.register(AssetCategory)
class AssetCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "depreciation_method", "useful_life_years", "is_active")
    search_fields = ("name", "code")


@admin.register(FixedAsset)
class FixedAssetAdmin(admin.ModelAdmin):
    list_display = ("asset_code", "name", "category", "purchase_date", "purchase_cost", "current_value", "status")
    search_fields = ("asset_code", "name")
    list_filter = ("status", "category")
    inlines = [DepreciationScheduleInline]


@admin.register(DepreciationSchedule)
class DepreciationScheduleAdmin(admin.ModelAdmin):
    list_display = ("fixed_asset", "period", "opening_value", "depreciation", "closing_value")
