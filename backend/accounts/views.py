from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import (
    ChartOfAccount, JournalEntry, AccountsPayable,
    AccountsReceivable, Expense, CostCenter,
)
from .serializers import (
    ChartOfAccountSerializer, JournalEntrySerializer,
    AccountsPayableSerializer, AccountsReceivableSerializer,
    ExpenseSerializer, CostCenterSerializer,
)


class ChartOfAccountViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ChartOfAccount.objects.all()
    serializer_class = ChartOfAccountSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "account_type", "is_active", "parent"]
    search_fields = ["account_code", "account_name"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "parent")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class JournalEntryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "account", "currency", "entry_date"]
    search_fields = ["entry_number", "description", "reference"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "account", "currency")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class AccountsPayableViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = AccountsPayable.objects.all()
    serializer_class = AccountsPayableSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "supplier", "status"]
    search_fields = ["invoice_number", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "supplier")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class AccountsReceivableViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = AccountsReceivable.objects.all()
    serializer_class = AccountsReceivableSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "buyer", "status"]
    search_fields = ["invoice_number", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "buyer")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class ExpenseViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "cost_center", "category", "status"]
    search_fields = ["category", "description", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "cost_center", "currency")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class CostCenterViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = CostCenter.objects.all()
    serializer_class = CostCenterSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "is_active", "department"]
    search_fields = ["name", "code", "department"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()
