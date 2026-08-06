from django.db import models
from merchandising.models import Style, PurchaseOrder


class Task(models.Model):
    parent_task = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="sub_tasks"
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    style = models.ForeignKey(
        Style, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    duration_days = models.PositiveIntegerField()
    priority = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High"), ("critical", "Critical")],
        default="medium",
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("not_started", "Not Started"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("delayed", "Delayed"),
            ("cancelled", "Cancelled"),
        ],
        default="not_started",
    )
    progress = models.PositiveIntegerField(default=0, help_text="Percentage 0-100")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"

    def __str__(self):
        return self.title


class JobOrder(models.Model):
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name="job_orders"
    )
    job_order_number = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    assigned_department = models.CharField(max_length=255)
    assigned_person = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("delayed", "Delayed"),
        ],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Job Order"
        verbose_name_plural = "Job Orders"
        unique_together = ("job_order_number",)

    def __str__(self):
        return f"JO {self.job_order_number} - {self.task.title}"


class Timeline(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="timelines"
    )
    style = models.ForeignKey(
        Style, on_delete=models.CASCADE, related_name="timelines"
    )
    milestone = models.CharField(max_length=255)
    planned_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("on_track", "On Track"), ("completed", "Completed"), ("delayed", "Delayed")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Timeline"
        verbose_name_plural = "Timelines"

    def __str__(self):
        return f"{self.style.style_number} - {self.milestone}"


class AlarmNotification(models.Model):
    task = models.ForeignKey(
        Task, on_delete=models.SET_NULL, null=True, blank=True, related_name="alarms"
    )
    alarm_type = models.CharField(
        max_length=50,
        choices=[("sms", "SMS"), ("email", "Email"), ("in_app", "In-App Notification")],
    )
    recipient = models.CharField(max_length=255)
    message = models.TextField()
    scheduled_at = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("scheduled", "Scheduled"), ("sent", "Sent"), ("failed", "Failed")],
        default="scheduled",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Alarm Notification"
        verbose_name_plural = "Alarm Notifications"

    def __str__(self):
        return f"{self.alarm_type} - {self.recipient} - {self.scheduled_at}"
