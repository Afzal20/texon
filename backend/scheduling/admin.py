from django.contrib import admin

from .models import Schedule


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("production_order", "production_line", "scheduled_date", "target_quantity", "status")
    list_filter = ("status",)
