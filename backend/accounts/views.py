from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

from core.mixins import OwnerQuerysetMixin
from core.permissions import IsFinanceRole, IsObjectOwnerOrStaff

from .models import (
    AccountsPayable,
    AccountsReceivable,
    ChartOfAccount,
    CostCenter,
    Expense,
    JournalEntry,
)
from .serializers import (
    AccountsPayableSerializer,
    AccountsReceivableSerializer,
    ChartOfAccountSerializer,
    CostCenterSerializer,
    ExpenseSerializer,
    JournalEntrySerializer,
)

# Finance data is department-restricted: finance tier (or superuser) only,
# plus Django model permissions and object-level ownership checks.
PERMISSION_CLASSES = [
    IsAuthenticated,
    IsFinanceRole,
    DjangoModelPermissions,
    IsObjectOwnerOrStaff,
]


class ChartOfAccountViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = ChartOfAccount.objects.all()
    serializer_class = ChartOfAccountSerializer
    permission_classes = PERMISSION_CLASSES
    filterset_fields = ["account_type", "is_active", "parent"]
    search_fields = ["account_code", "account_name"]
    ordering_fields = ["account_code", "account_name", "created_at"]


class JournalEntryViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = JournalEntry.objects.select_related("account", "currency").all()
    serializer_class = JournalEntrySerializer
    permission_classes = PERMISSION_CLASSES
    filterset_fields = ["entry_date", "account", "currency", "reference"]
    search_fields = ["entry_number", "description", "reference"]
    ordering_fields = ["entry_date", "created_at"]


class AccountsPayableViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = AccountsPayable.objects.select_related("supplier").all()
    serializer_class = AccountsPayableSerializer
    permission_classes = PERMISSION_CLASSES
    filterset_fields = ["supplier", "status", "invoice_date", "due_date"]
    search_fields = ["invoice_number", "supplier__name"]
    ordering_fields = ["invoice_date", "due_date", "amount", "balance"]


class AccountsReceivableViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = AccountsReceivable.objects.select_related("buyer").all()
    serializer_class = AccountsReceivableSerializer
    permission_classes = PERMISSION_CLASSES
    filterset_fields = ["buyer", "status", "invoice_date", "due_date"]
    search_fields = ["invoice_number", "buyer__name"]
    ordering_fields = ["invoice_date", "due_date", "amount", "balance"]


class ExpenseViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("cost_center", "currency").all()
    serializer_class = ExpenseSerializer
    permission_classes = PERMISSION_CLASSES
    filterset_fields = ["cost_center", "category", "status", "expense_date", "currency"]
    search_fields = ["category", "description", "notes"]
    ordering_fields = ["expense_date", "amount", "created_at"]


class CostCenterViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = CostCenter.objects.all()
    serializer_class = CostCenterSerializer
    permission_classes = PERMISSION_CLASSES
    filterset_fields = ["department", "is_active"]
    search_fields = ["name", "code", "department"]
    ordering_fields = ["name", "code", "budget"]