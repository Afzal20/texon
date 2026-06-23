from django.db import models
from auditlog.registry import auditlog

class ProductionUnit(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="production_units")
    name = models.CharField(max_length=255)  # Unit A - Wovens
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class ProductionLine(models.Model):
    production_unit = models.ForeignKey(ProductionUnit, on_delete=models.CASCADE, related_name="lines")
    name = models.CharField(max_length=255)  # Sewing Line S1
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.production_unit.name} - {self.name}"

class LineCapacity(models.Model):
    production_line = models.OneToOneField(ProductionLine, on_delete=models.CASCADE, related_name="capacity")
    daily_capacity_pcs = models.PositiveIntegerField()  # 5000 pcs/day
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.production_line.name} capacity: {self.daily_capacity_pcs}"

class ProductionShift(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="shifts")
    name = models.CharField(max_length=100)  # Shift 1, Shift 2
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return self.name

class ProductionRecord(models.Model):
    production_line = models.ForeignKey(ProductionLine, on_delete=models.CASCADE, related_name="records")
    shift = models.ForeignKey(ProductionShift, on_delete=models.CASCADE, related_name="records")
    output_pcs = models.PositiveIntegerField()
    timestamp = models.DateTimeField(db_index=True)  # indexed for time-series optimization
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.production_line.name} - {self.timestamp} ({self.output_pcs} pcs)"

class OEELog(models.Model):
    production_line = models.ForeignKey(ProductionLine, on_delete=models.CASCADE, related_name="oee_logs")
    availability_rate = models.DecimalField(max_digits=5, decimal_places=2)  # percentage
    performance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    quality_rate = models.DecimalField(max_digits=5, decimal_places=2)
    oee_score = models.DecimalField(max_digits=5, decimal_places=2)  # calculated OEE
    timestamp = models.DateTimeField(db_index=True)

    def __str__(self):
        return f"{self.production_line.name} OEE: {self.oee_score}% at {self.timestamp}"

class DowntimeEvent(models.Model):
    production_line = models.ForeignKey(ProductionLine, on_delete=models.CASCADE, related_name="downtime_events")
    reason = models.CharField(max_length=255)  # Line 04 motor failure
    duration_minutes = models.PositiveIntegerField()
    started_at = models.DateTimeField(db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.production_line.name} down for {self.reason} ({self.duration_minutes}m)"

class DefectLog(models.Model):
    production_line = models.ForeignKey(ProductionLine, on_delete=models.CASCADE, related_name="defect_logs")
    defect_type = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    checked_units = models.PositiveIntegerField()
    timestamp = models.DateTimeField(db_index=True)

    @property
    def dhu(self):
        if self.checked_units > 0:
            return (self.quantity / self.checked_units) * 100
        return 0

    def __str__(self):
        return f"{self.production_line.name} - {self.defect_type} ({self.quantity} defects)"

class HeatmapData(models.Model):
    production_line = models.ForeignKey(ProductionLine, on_delete=models.CASCADE, related_name="heatmap_data")
    activity_score = models.IntegerField()  # floor activity metric
    timestamp = models.DateTimeField(db_index=True)

    def __str__(self):
        return f"{self.production_line.name} score {self.activity_score} at {self.timestamp}"

class BottleneckAlert(models.Model):
    production_line = models.ForeignKey(ProductionLine, on_delete=models.CASCADE, related_name="bottleneck_alerts")
    alert_message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        status = "Resolved" if self.is_resolved else "Active"
        return f"Bottleneck Alert: {self.production_line.name} ({status})"

auditlog.register(ProductionUnit)
auditlog.register(ProductionLine)
auditlog.register(LineCapacity)
auditlog.register(ProductionShift)
auditlog.register(ProductionRecord)
auditlog.register(OEELog)
auditlog.register(DowntimeEvent)
auditlog.register(DefectLog)
auditlog.register(HeatmapData)
auditlog.register(BottleneckAlert)
