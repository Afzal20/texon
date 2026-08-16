from django.contrib import admin

from unfold.admin import ModelAdmin
from unfold.paginator import InfinitePaginator

from .models import Order


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    # ModelAdmin options
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
    list_filter_options = {
        "status": {"label": "Order status"},
        "priority": {"label": "Priority"},
    }
    list_disable_select_all = False
    warn_unsaved_form = True
    show_change_link = True
    # Paginator - infinite scroll pagination
    paginator = InfinitePaginator

    list_display = ("order_number", "buyer", "style", "order_date", "delivery_date", "quantity", "total_value", "status", "priority")
    search_fields = ("order_number",)
    list_filter = ("status", "priority")
    list_per_page = 25
