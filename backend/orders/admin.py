from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "buyer", "style", "order_date", "delivery_date", "quantity", "total_value", "status", "priority")
    search_fields = ("order_number",)
    list_filter = ("status", "priority")
