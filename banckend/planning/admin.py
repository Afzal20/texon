from django.contrib import admin
from .models import ProductionPlan, PlanEntry, ResourceConflict, MachineSchedule

class PlanEntryInline(admin.TabularInline):
    model = PlanEntry
    extra = 1

@admin.register(ProductionPlan)
class ProductionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'organization')
    search_fields = ('name',)
    list_filter = ('organization', 'start_date')
    inlines = [PlanEntryInline]

@admin.register(PlanEntry)
class PlanEntryAdmin(admin.ModelAdmin):
    list_display = ('production_plan', 'purchase_order', 'production_line', 'start_date', 'end_date')
    search_fields = ('purchase_order__po_number', 'production_line__name')
    list_filter = ('start_date', 'production_plan')

@admin.register(ResourceConflict)
class ResourceConflictAdmin(admin.ModelAdmin):
    list_display = ('production_plan', 'conflict_description', 'is_resolved', 'created_at')
    search_fields = ('conflict_description',)
    list_filter = ('is_resolved', 'production_plan')

@admin.register(MachineSchedule)
class MachineScheduleAdmin(admin.ModelAdmin):
    list_display = ('machine_name', 'start_time', 'end_time', 'is_available', 'organization')
    search_fields = ('machine_name',)
    list_filter = ('organization', 'is_available')
