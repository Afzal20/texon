from django.contrib import admin

from .models import (
    AccountsPayable,
    AccountsReceivable,
    ChartOfAccount,
    CostCenter,
    Expense,
    JournalEntry,
)


@admin.register(ChartOfAccount)
class ChartOfAccountAdmin(admin.ModelAdmin):
    list_display = ("account_code", "account_name", "account_type", "parent", "is_active")
    search_fields = ("account_code", "account_name")
    list_filter = ("account_type", "is_active")


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ("entry_number", "entry_date", "account", "debit", "credit", "created_by")
    search_fields = ("entry_number",)


@admin.register(AccountsPayable)
class AccountsPayableAdmin(admin.ModelAdmin):
    list_display = ("supplier", "invoice_number", "invoice_date", "due_date", "amount", "balance", "status")
    list_filter = ("status",)


@admin.register(AccountsReceivable)
class AccountsReceivableAdmin(admin.ModelAdmin):
    list_display = ("buyer", "invoice_number", "invoice_date", "due_date", "amount", "balance", "status")
    list_filter = ("status",)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("category", "description", "amount", "expense_date", "cost_center", "status")
    list_filter = ("category", "status")


@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "department", "budget", "is_active")
    search_fields = ("name", "code")
