from rest_framework import serializers
from core.models import Organization, Currency
from buyers.models import Buyer
from procurement.models import Supplier

from .models import (
    ChartOfAccount, JournalEntry, AccountsPayable,
    AccountsReceivable, Expense, CostCenter,
)


class ChartOfAccountSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    parent = serializers.PrimaryKeyRelatedField(
        queryset=ChartOfAccount.objects.all(), allow_null=True, required=False
    )  # FK -> self

    class Meta:
        model = ChartOfAccount
        fields = [
            "id", "organization", "account_code", "account_name",
            "account_type", "parent", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class JournalEntrySerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    account = serializers.PrimaryKeyRelatedField(
        queryset=ChartOfAccount.objects.all()
    )  # FK -> ChartOfAccount
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )  # FK -> Currency

    class Meta:
        model = JournalEntry
        fields = [
            "id", "organization", "entry_number", "entry_date",
            "description", "account", "debit", "credit",
            "currency", "reference", "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        debit = attrs.get("debit", 0)
        credit = attrs.get("credit", 0)
        if debit == 0 and credit == 0:
            raise serializers.ValidationError(
                "At least one of debit or credit must be non-zero."
            )
        return attrs


class AccountsPayableSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())  # FK -> Supplier

    class Meta:
        model = AccountsPayable
        fields = [
            "id", "organization", "supplier", "invoice_number",
            "invoice_date", "due_date", "amount", "paid_amount",
            "balance", "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("due_date") and attrs.get("invoice_date"):
            if attrs["due_date"] < attrs["invoice_date"]:
                raise serializers.ValidationError(
                    "Due date must be on or after invoice date."
                )
        return attrs


class AccountsReceivableSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())  # FK -> Buyer

    class Meta:
        model = AccountsReceivable
        fields = [
            "id", "organization", "buyer", "invoice_number",
            "invoice_date", "due_date", "amount", "received_amount",
            "balance", "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("due_date") and attrs.get("invoice_date"):
            if attrs["due_date"] < attrs["invoice_date"]:
                raise serializers.ValidationError(
                    "Due date must be on or after invoice date."
                )
        return attrs


class ExpenseSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization
    cost_center = serializers.PrimaryKeyRelatedField(
        queryset=CostCenter.objects.all(), allow_null=True, required=False
    )  # FK -> CostCenter
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), allow_null=True, required=False
    )  # FK -> Currency

    class Meta:
        model = Expense
        fields = [
            "id", "organization", "cost_center", "expense_date",
            "category", "description", "amount", "currency",
            "approved_by", "status", "notes", "created_by",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value


class CostCenterSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())  # FK -> Organization

    class Meta:
        model = CostCenter
        fields = [
            "id", "organization", "name", "code",
            "department", "budget", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_budget(self, value):
        if value < 0:
            raise serializers.ValidationError("Budget cannot be negative.")
        return value
