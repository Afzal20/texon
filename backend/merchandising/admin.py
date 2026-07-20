from django.contrib import admin

from .models import (
    BudgetDemandAssessment,
    BuyerEnquiry,
    DevelopmentMonitoring,
    IeSuggestion,
    ProcessWiseTarget,
    ProductionDowntime,
    PurchaseOrder,
    SMVRecord,
    SampleOrder,
    SkillInventory,
    Style,
)


@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    list_display = ("style_number", "name", "buyer", "organization", "category", "is_active")
    search_fields = ("style_number", "name")
    list_filter = ("is_active", "category")


@admin.register(BuyerEnquiry)
class BuyerEnquiryAdmin(admin.ModelAdmin):
    list_display = ("buyer", "style", "enquiry_date", "status")
    list_filter = ("status",)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_number", "buyer", "style", "order_date", "delivery_date", "quantity", "status")
    search_fields = ("po_number",)
    list_filter = ("status",)


@admin.register(SampleOrder)
class SampleOrderAdmin(admin.ModelAdmin):
    list_display = ("sample_type", "style", "buyer", "request_date", "deadline", "status")
    list_filter = ("sample_type", "status")


@admin.register(SMVRecord)
class SMVRecordAdmin(admin.ModelAdmin):
    list_display = ("style", "smv", "calculated_by", "calculation_date")


@admin.register(DevelopmentMonitoring)
class DevelopmentMonitoringAdmin(admin.ModelAdmin):
    list_display = ("style", "supplier", "stage", "status")
    list_filter = ("status",)


@admin.register(BudgetDemandAssessment)
class BudgetDemandAssessmentAdmin(admin.ModelAdmin):
    list_display = ("buyer", "assessment_date", "forecast_quantity", "booked_quantity", "confidence")
    list_filter = ("confidence",)


@admin.register(IeSuggestion)
class IeSuggestionAdmin(admin.ModelAdmin):
    list_display = ("operation", "current_pph", "target_pph", "status", "production_line")
    list_filter = ("status",)


@admin.register(SkillInventory)
class SkillInventoryAdmin(admin.ModelAdmin):
    list_display = ("operator_name", "skill_name", "skill_level", "multi_skill", "production_line")
    list_filter = ("skill_level", "multi_skill")


@admin.register(ProductionDowntime)
class ProductionDowntimeAdmin(admin.ModelAdmin):
    list_display = ("cause", "production_line", "start_datetime", "duration_hours", "status")
    list_filter = ("status", "cause")


@admin.register(ProcessWiseTarget)
class ProcessWiseTargetAdmin(admin.ModelAdmin):
    list_display = ("process_name", "target_quantity", "achieved_quantity", "variance", "target_date", "status")
    list_filter = ("status", "process_name")
