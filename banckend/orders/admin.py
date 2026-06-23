from django.contrib import admin
from .models import Buyer, Season, Style, PurchaseOrder, OrderItem, OrderStageLog, SampleDevelopment, BuyerRating

@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'country', 'organization')
    search_fields = ('name', 'code')
    list_filter = ('organization', 'country')

@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ('name', 'year', 'organization')
    search_fields = ('name',)
    list_filter = ('organization', 'year')

@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    list_display = ('code', 'buyer', 'season', 'organization')
    search_fields = ('code', 'buyer__name')
    list_filter = ('organization', 'buyer', 'season')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'style', 'qty', 'ship_date', 'current_stage', 'organization')
    search_fields = ('po_number', 'style__code')
    list_filter = ('organization', 'current_stage', 'ship_date')
    inlines = [OrderItemInline]

@admin.register(OrderStageLog)
class OrderStageLogAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'stage', 'changed_by', 'changed_at')
    search_fields = ('purchase_order__po_number', 'stage')
    list_filter = ('changed_at',)

@admin.register(SampleDevelopment)
class SampleDevelopmentAdmin(admin.ModelAdmin):
    list_display = ('style', 'sample_type', 'status', 'submission_date')
    search_fields = ('style__code', 'sample_type')
    list_filter = ('status', 'sample_type')

@admin.register(BuyerRating)
class BuyerRatingAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'rating', 'reviews_count')
    search_fields = ('buyer__name',)
