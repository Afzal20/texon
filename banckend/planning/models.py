from django.db import models
from auditlog.registry import auditlog

class ProductionPlan(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="production_plans")
    name = models.CharField(max_length=255)  # Weekly plan (Nov 12 - Nov 18)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PlanEntry(models.Model):
    production_plan = models.ForeignKey(ProductionPlan, on_delete=models.CASCADE, related_name="entries")
    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE, related_name="plan_entries")
    production_line = models.ForeignKey('production.ProductionLine', on_delete=models.CASCADE, related_name="plan_entries")
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.purchase_order.po_number} on {self.production_line.name} ({self.start_date} to {self.end_date})"

class ResourceConflict(models.Model):
    production_plan = models.ForeignKey(ProductionPlan, on_delete=models.CASCADE, related_name="conflicts")
    conflict_description = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conflict in {self.production_plan.name}: {self.conflict_description[:30]}"

class MachineSchedule(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="machine_schedules")
    machine_name = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.machine_name} schedule"

auditlog.register(ProductionPlan)
auditlog.register(PlanEntry)
auditlog.register(ResourceConflict)
auditlog.register(MachineSchedule)
