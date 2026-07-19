from django.contrib import admin

from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("title", "plan_type", "start_date", "end_date", "status", "created_by")
    list_filter = ("plan_type", "status")
