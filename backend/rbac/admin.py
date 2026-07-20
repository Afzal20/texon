from django.contrib import admin

from .models import Permission, Role, RolePermission, UserRole


class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1
    autocomplete_fields = ["permission"]


class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 1
    autocomplete_fields = ["role"]


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("codename", "label", "group")
    list_filter = ("group",)
    search_fields = ("codename", "label", "group")
    ordering = ("group", "codename")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "is_system", "permission_count")
    list_filter = ("is_system",)
    search_fields = ("name",)
    inlines = [RolePermissionInline]

    @admin.display(description="Permissions")
    def permission_count(self, obj):
        return obj.permissions.count()


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
    search_fields = ("user__email", "role__name")
    autocomplete_fields = ["user", "role"]
