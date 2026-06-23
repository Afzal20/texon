from django.contrib import admin
from .models import CuttingMachine, CuttingOrder, Marker, NestingPlan, PatternPiece, NestingResult, CuttingQueue

@admin.register(CuttingMachine)
class CuttingMachineAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'organization')
    search_fields = ('name',)
    list_filter = ('organization', 'is_active')

class MarkerInline(admin.TabularInline):
    model = Marker
    extra = 1

@admin.register(CuttingOrder)
class CuttingOrderAdmin(admin.ModelAdmin):
    list_display = ('order_no', 'purchase_order', 'target_qty', 'status', 'organization')
    search_fields = ('order_no', 'purchase_order__po_number')
    list_filter = ('organization', 'status')
    inlines = [MarkerInline]

@admin.register(Marker)
class MarkerAdmin(admin.ModelAdmin):
    list_display = ('name', 'cutting_order', 'width_inches', 'length_yards', 'organization')
    search_fields = ('name', 'cutting_order__order_no')
    list_filter = ('organization',)

@admin.register(NestingPlan)
class NestingPlanAdmin(admin.ModelAdmin):
    list_display = ('marker', 'created_at')
    search_fields = ('marker__name',)

@admin.register(PatternPiece)
class PatternPieceAdmin(admin.ModelAdmin):
    list_display = ('piece_name', 'marker')
    search_fields = ('piece_name', 'marker__name')

@admin.register(NestingResult)
class NestingResultAdmin(admin.ModelAdmin):
    list_display = ('nesting_plan', 'utilization_percentage', 'waste_area_sq_yards', 'piece_count')
    list_filter = ('utilization_percentage',)

@admin.register(CuttingQueue)
class CuttingQueueAdmin(admin.ModelAdmin):
    list_display = ('cutting_order', 'cutting_machine', 'priority', 'assigned_at')
    search_fields = ('cutting_order__order_no',)
    list_filter = ('priority',)
