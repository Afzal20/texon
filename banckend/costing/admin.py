from django.contrib import admin
from .models import BOMCategory, SupplierQuote, BillOfMaterials, BOMItem, CostRevision, ApprovalWorkflow

@admin.register(BOMCategory)
class BOMCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(SupplierQuote)
class SupplierQuoteAdmin(admin.ModelAdmin):
    list_display = ('supplier_name', 'item_description', 'unit_price', 'currency', 'organization')
    search_fields = ('supplier_name', 'item_description')
    list_filter = ('organization', 'currency')

class BOMItemInline(admin.TabularInline):
    model = BOMItem
    extra = 1

@admin.register(BillOfMaterials)
class BillOfMaterialsAdmin(admin.ModelAdmin):
    list_display = ('style_code', 'purchase_order', 'version', 'is_approved', 'organization')
    search_fields = ('style_code', 'purchase_order__po_number')
    list_filter = ('organization', 'is_approved')
    inlines = [BOMItemInline]

@admin.register(BOMItem)
class BOMItemAdmin(admin.ModelAdmin):
    list_display = ('description', 'bill_of_materials', 'category', 'required_qty', 'unit_price', 'wastage_percentage')
    search_fields = ('description', 'bill_of_materials__style_code')
    list_filter = ('category',)

@admin.register(CostRevision)
class CostRevisionAdmin(admin.ModelAdmin):
    list_display = ('bill_of_materials', 'revised_by', 'revision_date')
    search_fields = ('bill_of_materials__style_code',)
    list_filter = ('revision_date',)

@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ('bill_of_materials', 'approver', 'status', 'actioned_at')
    search_fields = ('bill_of_materials__style_code', 'approver__email')
    list_filter = ('status', 'actioned_at')
