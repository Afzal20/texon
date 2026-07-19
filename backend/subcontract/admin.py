from django.contrib import admin

from .models import SubcontractOrder, SubcontractTracking


class SubcontractTrackingInline(admin.TabularInline):
    model = SubcontractTracking


@admin.register(SubcontractOrder)
class SubcontractOrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "subcontractor_name", "process", "quantity", "start_date", "expected_completion", "status")
    list_filter = ("process", "status")
    inlines = [SubcontractTrackingInline]


@admin.register(SubcontractTracking)
class SubcontractTrackingAdmin(admin.ModelAdmin):
    list_display = ("subcontract_order", "tracking_date", "quantity_received", "quantity_passed", "quantity_rejected")
