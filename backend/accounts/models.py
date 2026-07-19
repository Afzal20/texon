from django.db import models
from core.models import Organization, Currency
from buyers.models import Buyer
from procurement.models import Supplier


class ChartOfAccount(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="chart_of_accounts"
    )
    account_code = models.CharField(max_length=50)
    account_name = models.CharField(max_length=255)
    account_type = models.CharField(
        max_length=50,
        choices=[
            ("asset", "Asset"),
            ("liability", "Liability"),
            ("equity", "Equity"),
            ("revenue", "Revenue"),
            ("expense", "Expense"),
        ],
    )
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Chart of Account"
        verbose_name_plural = "Chart of Accounts"
        unique_together = ("organization", "account_code")

    def __str__(self):
        return f"{self.account_code} - {self.account_name}"


class JournalEntry(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="journal_entries"
    )
    entry_number = models.CharField(max_length=100)
    entry_date = models.DateField()
    description = models.TextField(blank=True)
    account = models.ForeignKey(
        ChartOfAccount, on_delete=models.CASCADE, related_name="journal_entries"
    )
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    reference = models.CharField(max_length=100, blank=True)
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Journal Entry"
        verbose_name_plural = "Journal Entries"

    def __str__(self):
        return f"JE {self.entry_number} - {self.entry_date}"


class AccountsPayable(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="accounts_payable"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, related_name="payables"
    )
    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("partial", "Partially Paid"), ("paid", "Paid"), ("overdue", "Overdue")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Accounts Payable"
        verbose_name_plural = "Accounts Payable"

    def __str__(self):
        return f"AP - {self.supplier.name} - {self.invoice_number}"


class AccountsReceivable(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="accounts_receivable"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="receivables"
    )
    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    received_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("partial", "Partially Received"), ("received", "Fully Received"), ("overdue", "Overdue")],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Accounts Receivable"
        verbose_name_plural = "Accounts Receivable"

    def __str__(self):
        return f"AR - {self.buyer.name} - {self.invoice_number}"


class Expense(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="expenses"
    )
    cost_center = models.ForeignKey(
        "CostCenter", on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses"
    )
    expense_date = models.DateField()
    category = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    approved_by = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("draft", "Draft"), ("pending", "Pending Approval"), ("approved", "Approved"), ("rejected", "Rejected")],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

    def __str__(self):
        return f"{self.category} - {self.amount} - {self.expense_date}"


class CostCenter(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="cost_centers"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    department = models.CharField(max_length=100, blank=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cost Center"
        verbose_name_plural = "Cost Centers"
        unique_together = ("organization", "code")

    def __str__(self):
        return f"{self.name} ({self.code})"
