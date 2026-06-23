from django.contrib import admin
from .models import ProductionUnit, ProductionLine, LineCapacity, ProductionShift, ProductionRecord, OEELog, DowntimeEvent, DefectLog, HeatmapData, BottleneckAlert

@admin.register(ProductionUnit)
class ProductionUnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(ProductionLine)
class ProductionLineAdmin(admin.ModelAdmin):
    list_display = ('name', 'production_unit', 'is_active')
    search_fields = ('name', 'production_unit__name')
    list_filter = ('is_active', 'production_unit')

@admin.register(LineCapacity)
class LineCapacityAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'daily_capacity_pcs')
    search_fields = ('production_line__name',)

@admin.register(ProductionShift)
class ProductionShiftAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(ProductionRecord)
class ProductionRecordAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'shift', 'output_pcs', 'timestamp')
    search_fields = ('production_line__name',)
    list_filter = ('timestamp', 'shift', 'production_line')

@admin.register(OEELog)
class OEELogAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'oee_score', 'availability_rate', 'performance_rate', 'quality_rate', 'timestamp')
    search_fields = ('production_line__name',)
    list_filter = ('timestamp', 'production_line')

@admin.register(DowntimeEvent)
class DowntimeEventAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'reason', 'duration_minutes', 'started_at', 'resolved_at')
    search_fields = ('production_line__name', 'reason')
    list_filter = ('started_at', 'production_line')

@admin.register(DefectLog)
class DefectLogAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'defect_type', 'quantity', 'checked_units', 'timestamp')
    search_fields = ('production_line__name', 'defect_type')
    list_filter = ('timestamp', 'production_line')

@admin.register(HeatmapData)
class HeatmapDataAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'activity_score', 'timestamp')
    search_fields = ('production_line__name',)
    list_filter = ('timestamp',)

@admin.register(BottleneckAlert)
class BottleneckAlertAdmin(admin.ModelAdmin):
    list_display = ('production_line', 'alert_message', 'is_resolved', 'created_at')
    search_fields = ('production_line__name', 'alert_message')
    list_filter = ('is_resolved', 'created_at')
