from django.contrib import admin

from .models import GroupCompany, LocationBasedOperation, MultiCompany


@admin.register(GroupCompany)
class GroupCompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "country", "is_active")
    search_fields = ("name", "code")


@admin.register(MultiCompany)
class MultiCompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "parent_company", "country", "is_active")


@admin.register(LocationBasedOperation)
class LocationBasedOperationAdmin(admin.ModelAdmin):
    list_display = ("multi_company", "location", "operation_type", "is_active")
