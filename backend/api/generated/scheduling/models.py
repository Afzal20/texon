from django.db import models
from django.conf import settings

class CapacityBooking(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='capacity_booking_set',
    )
    style = models.IntegerField()
    line = models.CharField(max_length=100)
    capacity_per_day = models.CharField()
    booking_date = models.DateField()
    allocated_days = models.CharField()
    status = models.CharField(max_length=50, choices=[('allocated', 'Allocated'), ('in_use', 'In Use'), ('released', 'Released')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'capacity_booking'
        verbose_name = 'CapacityBooking'
        verbose_name_plural = 'CapacityBookings'


class LinePlan(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='line_plan_set',
    )
    style = models.IntegerField()
    line = models.CharField(max_length=100)
    plan_date = models.DateField()
    target_quantity = models.CharField()
    status = models.CharField(max_length=50, choices=[('planned', 'Planned'), ('running', 'Running'), ('completed', 'Completed')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'line_plan'
        verbose_name = 'LinePlan'
        verbose_name_plural = 'LinePlans'


class ProductionPlan(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='production_plan_set',
    )
    purchase_order = models.IntegerField()
    style = models.IntegerField()
    planned_start_date = models.DateField()
    planned_end_date = models.DateField()
    daily_target = models.CharField()
    total_quantity = models.CharField()
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('approved', 'Approved'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('on_hold', 'On Hold')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'production_plan'
        verbose_name = 'ProductionPlan'
        verbose_name_plural = 'ProductionPlans'


class Schedule(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='schedule_set',
    )
    production_order = models.IntegerField()
    production_line = models.IntegerField()
    scheduled_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    target_quantity = models.CharField()
    status = models.CharField(max_length=50, choices=[('scheduled', 'Scheduled'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('rescheduled', 'Rescheduled'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'schedule'
        verbose_name = 'Schedule'
        verbose_name_plural = 'Schedules'

