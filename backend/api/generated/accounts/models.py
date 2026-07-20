from django.db import models
from django.conf import settings

class AccountsPayable(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='accounts_payable_set',
    )
    supplier = models.IntegerField()
    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('partial', 'Partial'), ('paid', 'Paid'), ('overdue', 'Overdue')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'accounts_payable'
        verbose_name = 'AccountsPayable'
        verbose_name_plural = 'AccountsPayables'
    def __str__(self):
        return str(getattr(self, 'invoice_number', ''))


class AccountsReceivable(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='accounts_receivable_set',
    )
    buyer = models.IntegerField()
    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    received_amount = models.DecimalField(max_digits=15, decimal_places=2)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('partial', 'Partial'), ('received', 'Received'), ('overdue', 'Overdue')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'accounts_receivable'
        verbose_name = 'AccountsReceivable'
        verbose_name_plural = 'AccountsReceivables'
    def __str__(self):
        return str(getattr(self, 'invoice_number', ''))


class ChartOfAccount(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='chart_of_account_set',
    )
    account_code = models.CharField(max_length=50)
    account_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50, choices=[('asset', 'Asset'), ('liability', 'Liability'), ('equity', 'Equity'), ('revenue', 'Revenue'), ('expense', 'Expense')])
    parent = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'chart_of_account'
        verbose_name = 'ChartOfAccount'
        verbose_name_plural = 'ChartOfAccounts'


class CostCenter(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='cost_center_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    department = models.CharField(max_length=100)
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'cost_center'
        verbose_name = 'CostCenter'
        verbose_name_plural = 'CostCenters'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class Expense(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='expense_set',
    )
    cost_center = models.IntegerField(null=True, blank=True)
    expense_date = models.DateField()
    category = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.IntegerField(null=True, blank=True)
    approved_by = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')])
    notes = models.CharField(max_length=255)
    created_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'expense'
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
    def __str__(self):
        return str(getattr(self, 'description', ''))


class Invoice(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='invoice_set',
    )
    purchase_order = models.IntegerField()
    buyer = models.IntegerField()
    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('submitted', 'Submitted'), ('approved', 'Approved'), ('paid', 'Paid'), ('cancelled', 'Cancelled')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'invoice'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
    def __str__(self):
        return str(getattr(self, 'invoice_number', ''))


class JournalEntry(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='journal_entry_set',
    )
    entry_number = models.CharField(max_length=100)
    entry_date = models.DateField()
    description = models.CharField(max_length=255)
    account = models.IntegerField()
    debit = models.DecimalField(max_digits=15, decimal_places=2)
    credit = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.IntegerField(null=True, blank=True)
    reference = models.CharField(max_length=100)
    created_by = models.CharField(max_length=255)

    class Meta:
        db_table = 'journal_entry'
        verbose_name = 'JournalEntry'
        verbose_name_plural = 'JournalEnties'
    def __str__(self):
        return str(getattr(self, 'description', ''))

