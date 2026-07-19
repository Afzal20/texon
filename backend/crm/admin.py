from django.contrib import admin

from .models import BuyerCommunication, BuyerProfitability, OrderAmendmentHistory


@admin.register(BuyerCommunication)
class BuyerCommunicationAdmin(admin.ModelAdmin):
    list_display = ("buyer", "communication_type", "subject", "communication_date", "follow_up_date", "status")
    list_filter = ("communication_type", "status")


@admin.register(BuyerProfitability)
class BuyerProfitabilityAdmin(admin.ModelAdmin):
    list_display = ("buyer", "period_start", "period_end", "total_revenue", "profit", "profit_margin")


@admin.register(OrderAmendmentHistory)
class OrderAmendmentHistoryAdmin(admin.ModelAdmin):
    list_display = ("purchase_order", "amendment_date", "amended_by")
