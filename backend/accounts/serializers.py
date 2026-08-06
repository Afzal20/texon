from rest_framework import serializers

from .models import (
    AccountsPayable,
    AccountsReceivable,
    ChartOfAccount,
    CostCenter,
    Expense,
    JournalEntry,
)


class ChartOfAccountSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.account_name", read_only=True)

    class Meta:
        model = ChartOfAccount
        fields = [
            "id",
            "account_code",
            "account_name",
            "account_type",
            "parent",
            "parent_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class JournalEntrySerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source="account.account_code", read_only=True)
    account_name = serializers.CharField(source="account.account_name", read_only=True)
    currency_code = serializers.CharField(source="currency.code", read_only=True)

    class Meta:
        model = JournalEntry
        fields = [
            "id",
            "entry_number",
            "entry_date",
            "description",
            "account",
            "account_code",
            "account_name",
            "debit",
            "credit",
            "currency",
            "currency_code",
            "reference",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AccountsPayableSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)

    class Meta:
        model = AccountsPayable
        fields = [
            "id",
            "supplier",
            "supplier_name",
            "invoice_number",
            "invoice_date",
            "due_date",
            "amount",
            "paid_amount",
            "balance",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AccountsReceivableSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)

    class Meta:
        model = AccountsReceivable
        fields = [
            "id",
            "buyer",
            "buyer_name",
            "invoice_number",
            "invoice_date",
            "due_date",
            "amount",
            "received_amount",
            "balance",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ExpenseSerializer(serializers.ModelSerializer):
    cost_center_name = serializers.CharField(source="cost_center.name", read_only=True)
    currency_code = serializers.CharField(source="currency.code", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "cost_center",
            "cost_center_name",
            "expense_date",
            "category",
            "description",
            "amount",
            "currency",
            "currency_code",
            "approved_by",
            "status",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCenter
        fields = [
            "id",
            "name",
            "code",
            "department",
            "budget",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
