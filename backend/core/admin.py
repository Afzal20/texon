from django.contrib import admin

from .models import Currency, Location, OutboxCommand


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "city", "country", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active", "country")


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "symbol", "exchange_rate", "is_base", "is_active")
    list_filter = ("is_base", "is_active")


@admin.register(OutboxCommand)
class OutboxCommandAdmin(admin.ModelAdmin):
    list_display = (
        "operation_uuid", "command_name", "company_id", "aggregate_id",
        "status", "attempt_count", "next_attempt_at", "created_at"
    )
    list_filter = ("status", "command_name", "company_id")
    search_fields = ("operation_uuid", "fingerprint", "aggregate_id", "actor_id")
    readonly_fields = (
        "operation_uuid", "fingerprint", "tenant_id", "company_id", "actor_id",
        "command_name", "schema_version", "aggregate_id", "expected_revision",
        "payload_json", "response_data", "created_at", "updated_at"
    )

