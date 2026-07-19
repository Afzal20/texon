from django.contrib import admin

from .models import Currency, Location, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "phone", "email", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "city", "country", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active", "country")


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "symbol", "exchange_rate", "is_base", "is_active")
    list_filter = ("is_base", "is_active")
