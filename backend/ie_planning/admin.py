from django.contrib import admin

from .models import (
    CapacityBooking,
    LinePlan,
    ProductionPlan,
    RiskAssessment,
    StyleAnalysis,
)


@admin.register(CapacityBooking)
class CapacityBookingAdmin(admin.ModelAdmin):
    list_display = ("style", "line", "capacity_per_day", "booking_date", "status")
    list_filter = ("status",)


@admin.register(LinePlan)
class LinePlanAdmin(admin.ModelAdmin):
    list_display = ("style", "line", "plan_date", "target_quantity", "status")
    list_filter = ("status",)


@admin.register(ProductionPlan)
class ProductionPlanAdmin(admin.ModelAdmin):
    list_display = ("style", "planned_start_date", "planned_end_date", "daily_target", "status")
    list_filter = ("status",)


@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ("style", "risk_type", "severity", "likelihood", "status")
    list_filter = ("severity", "status")


@admin.register(StyleAnalysis)
class StyleAnalysisAdmin(admin.ModelAdmin):
    list_display = ("style", "analysis_type", "analyzed_by", "analysis_date")
    list_filter = ("analysis_type",)
