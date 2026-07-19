from django.contrib import admin

from .models import AlarmNotification, JobOrder, Task, Timeline


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "purchase_order", "style", "assigned_to", "start_date", "end_date", "priority", "status", "progress")
    list_filter = ("priority", "status")


@admin.register(JobOrder)
class JobOrderAdmin(admin.ModelAdmin):
    list_display = ("job_order_number", "task", "assigned_department", "start_date", "end_date", "status")
    list_filter = ("status",)


@admin.register(Timeline)
class TimelineAdmin(admin.ModelAdmin):
    list_display = ("style", "milestone", "planned_date", "actual_date", "status")
    list_filter = ("status",)


@admin.register(AlarmNotification)
class AlarmNotificationAdmin(admin.ModelAdmin):
    list_display = ("alarm_type", "recipient", "scheduled_at", "sent_at", "status")
    list_filter = ("alarm_type", "status")
