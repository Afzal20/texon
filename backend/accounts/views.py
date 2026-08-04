from rest_framework import mixins, viewsets, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.response import Response

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
        organization_id = self.request.query_params.get("organization_id")
        if organization_id:
            qs = qs.filter(organization_id=organization_id)
        return qs

    def create(self, request, *args, **kwargs):
        organization_id = request.data.get("organization")
        if not organization_id:
            raise ValidationError({"organization": "This field is required."})
        qs = self.get_queryset().filter(organization_id=organization_id)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
