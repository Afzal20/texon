from django.contrib import admin

from .models import (
    DefectCategory,
    EndLineQC,
    FabricInspection,
    FinalInspection,
    InlineQC,
    RejectionReport,
)


@admin.register(DefectCategory)
class DefectCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active")
    search_fields = ("name", "code")


@admin.register(FabricInspection)
class FabricInspectionAdmin(admin.ModelAdmin):
    list_display = ("inspection_date", "inspected_quantity", "passed_quantity", "rejected_quantity", "status")
    list_filter = ("status",)


@admin.register(InlineQC)
class InlineQCAdmin(admin.ModelAdmin):
    list_display = ("production_order", "production_line", "check_date", "checked_quantity", "defect_quantity", "status")
    list_filter = ("status",)


@admin.register(EndLineQC)
class EndLineQCAdmin(admin.ModelAdmin):
    list_display = ("production_order", "check_date", "checked_quantity", "passed_quantity", "failed_quantity", "status")
    list_filter = ("status",)


@admin.register(RejectionReport)
class RejectionReportAdmin(admin.ModelAdmin):
    list_display = ("production_order", "report_date", "stage", "rejected_quantity", "defect_category")
    list_filter = ("stage",)


@admin.register(FinalInspection)
class FinalInspectionAdmin(admin.ModelAdmin):
    list_display = ("production_order", "inspection_date", "inspected_quantity", "passed_quantity", "failed_quantity", "status")
    list_filter = ("status",)
