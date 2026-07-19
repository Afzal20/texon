from django.contrib import admin

from .models import PerformanceRecord


@admin.register(PerformanceRecord)
class PerformanceRecordAdmin(admin.ModelAdmin):
    list_display = ("metric", "value", "target", "record_date", "production_line")
    list_filter = ("metric",)
