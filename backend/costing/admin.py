from django.contrib import admin

from .models import CostSheet, PreCosting


@admin.register(PreCosting)
class PreCostingAdmin(admin.ModelAdmin):
    list_display = ("style", "buyer", "cost_date", "total_estimated_cost", "target_price", "expected_margin", "status")
    list_filter = ("status",)


@admin.register(CostSheet)
class CostSheetAdmin(admin.ModelAdmin):
    list_display = ("style", "cost_date", "total_cost", "selling_price", "margin", "status")
    list_filter = ("status",)
