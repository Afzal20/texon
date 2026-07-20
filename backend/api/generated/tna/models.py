from django.db import models
from django.conf import settings

class AlarmNotification(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='alarm_notification_set',
    )
    task = models.IntegerField(null=True, blank=True)
    alarm_type = models.CharField(max_length=50, choices=[('sms', 'Sms'), ('email', 'Email'), ('in_app', 'In App')])
    recipient = models.CharField(max_length=255)
    message = models.CharField(max_length=255)
    scheduled_at = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True, editable=False)
    status = models.CharField(max_length=50, choices=[('scheduled', 'Scheduled'), ('sent', 'Sent'), ('failed', 'Failed')])

    class Meta:
        db_table = 'alarm_notification'
        verbose_name = 'AlarmNotification'
        verbose_name_plural = 'AlarmNotifications'


class JobOrder(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='job_order_set',
    )
    task = models.IntegerField()
    job_order_number = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    assigned_department = models.CharField(max_length=255)
    assigned_person = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('delayed', 'Delayed')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'job_order'
        verbose_name = 'JobOrder'
        verbose_name_plural = 'JobOrders'
    def __str__(self):
        return str(getattr(self, 'description', ''))


class Task(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='task_set',
    )
    parent_task = models.IntegerField(null=True, blank=True)
    purchase_order = models.IntegerField(null=True, blank=True)
    style = models.IntegerField(null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    assigned_to = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    duration_days = models.CharField()
    priority = models.CharField(max_length=50, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')])
    status = models.CharField(max_length=50, choices=[('not_started', 'Not Started'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('delayed', 'Delayed'), ('cancelled', 'Cancelled')])
    progress = models.CharField()
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'task'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
    def __str__(self):
        return str(getattr(self, 'title', ''))


class Timeline(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='timeline_set',
    )
    purchase_order = models.IntegerField()
    style = models.IntegerField()
    milestone = models.CharField(max_length=255)
    planned_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('on_track', 'On Track'), ('completed', 'Completed'), ('delayed', 'Delayed')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'timeline'
        verbose_name = 'Timeline'
        verbose_name_plural = 'Timelines'

