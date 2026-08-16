from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group

from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.paginator import InfinitePaginator

from .models import OTP, User, SocialAuthCallbackUrl


admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    # Forms loaded from `unfold.forms`
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    # ModelAdmin options
    warn_unsaved_form = True
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True

    # Conditional fields - employee link only shown for staff users
    conditional_fields = {
        "employee": "is_staff == true",
    }

    list_display = ("email", "first_name", "last_name", "is_staff", "is_active", "is_verified")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone", "employee")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_verified", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2"),
        }),
    )


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


@admin.register(OTP)
class OTPAdmin(ModelAdmin):
    # ModelAdmin options
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
    list_disable_select_all = True
    # Paginator - infinite scroll pagination
    paginator = InfinitePaginator

    list_display = ("user", "code", "purpose", "is_used", "expires_at", "created_at")
    list_filter = ("purpose", "is_used")
    list_per_page = 25


@admin.register(SocialAuthCallbackUrl)
class SocialAuthCallbackUrlAdmin(ModelAdmin):
    list_display = ("provider", "callback_url")
    search_fields = ("provider",)
