from django.contrib import admin

from .models import Buyer, BuyerPortfolio, BuyerRating


class BuyerRatingInline(admin.StackedInline):
    model = BuyerRating


class BuyerPortfolioInline(admin.StackedInline):
    model = BuyerPortfolio


@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "country", "is_active")
    search_fields = ("name", "code", "country")
    list_filter = ("is_active", "country")
    inlines = [BuyerRatingInline, BuyerPortfolioInline]


@admin.register(BuyerRating)
class BuyerRatingAdmin(admin.ModelAdmin):
    list_display = ("buyer", "rating", "reviews_count")


@admin.register(BuyerPortfolio)
class BuyerPortfolioAdmin(admin.ModelAdmin):
    list_display = ("buyer", "active_orders", "total_units", "total_value")
