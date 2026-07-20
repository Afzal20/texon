from django.db import models
from django.conf import settings

class Plan(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='plan_set',
    )
    style = models.IntegerField(null=True, blank=True)
    purchase_order = models.IntegerField(null=True, blank=True)
    plan_type = models.CharField(max_length=50, choices=[('production', 'Production'), ('capacity', 'Capacity'), ('material', 'Material'), ('delivery', 'Delivery')])
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    details = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('active', 'Active'), ('completed', 'Completed'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)
    created_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'plan'
        verbose_name = 'Plan'
        verbose_name_plural = 'Plans'
    def __str__(self):
        return str(getattr(self, 'title', ''))


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

