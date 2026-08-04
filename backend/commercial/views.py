from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from core.pagination import StandardResultsPagination

from .models import (
    Shipment, LetterOfCredit, Invoice, BillOfExchange,
    SupplierDocument, Realization, SODFCTransfer, Disbursement,
)
from .serializers import (
    ShipmentSerializer, LetterOfCreditSerializer, InvoiceSerializer,
    BillOfExchangeSerializer, SupplierDocumentSerializer,
    RealizationSerializer, SODFCTransferSerializer, DisbursementSerializer,
)


class ShipmentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Shipment.objects.select_related("organization", "buyer", "supplier", "purchase_order").all()
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "direction", "shipment_type", "status", "clearance_status"]
    search_fields = ["shipment_number", "container_number", "forwarder", "vessel_name", "carrier"]
    ordering_fields = ["shipment_date", "etd", "eta", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()

    @action(detail=False, methods=["get"], url_path="dashboard-summary")
    def dashboard_summary(self, request):
        qs = self.get_queryset()
        total = qs.count()
        in_transit = qs.filter(status="in_transit").count()
        arrived = qs.filter(status="arrived").count()
        cleared = qs.filter(status="delivered").count()
        pending = qs.filter(status="booked").count()
        delayed = qs.filter(status="arrived").exclude(actual_arrival__lte="eta").count()

        return Response({
            "total": total,
            "in_transit": in_transit,
            "arrived": arrived,
            "cleared": cleared,
            "pending": pending,
            "delayed": delayed,
        })


class LetterOfCreditViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LetterOfCredit.objects.select_related("organization", "buyer", "supplier", "currency").all()
    serializer_class = LetterOfCreditSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "lc_type", "status"]
    search_fields = ["lc_number", "bank_name", "bank_reference"]
    ordering_fields = ["issue_date", "expiry_date", "amount", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        lc_type = self.request.query_params.get("lc_type")
        if lc_type:
            qs = qs.filter(lc_type=lc_type)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()


class InvoiceViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Invoice.objects.select_related(
        "organization", "buyer", "supplier", "purchase_order", "lc", "currency"
    ).all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "invoice_type", "status"]
    search_fields = ["invoice_number", "notes"]
    ordering_fields = ["invoice_date", "due_date", "amount", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()


class BillOfExchangeViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = BillOfExchange.objects.select_related(
        "organization", "lc", "buyer", "currency"
    ).all()
    serializer_class = BillOfExchangeSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "status"]
    search_fields = ["bill_number", "bank_name", "bank_reference"]
    ordering_fields = ["issue_date", "maturity_date", "amount", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()


class SupplierDocumentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SupplierDocument.objects.select_related(
        "organization", "supplier", "shipment", "purchase_order"
    ).all()
    serializer_class = SupplierDocumentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "document_type", "status"]
    search_fields = ["document_number", "notes"]
    ordering_fields = ["received_date", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()


class RealizationViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Realization.objects.select_related(
        "organization", "buyer", "invoice", "currency"
    ).all()
    serializer_class = RealizationSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "status", "short_reason"]
    search_fields = ["realization_number", "notes"]
    ordering_fields = ["realization_date", "due_date", "expected_amount", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()


class SODFCTransferViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SODFCTransfer.objects.select_related("organization", "currency").all()
    serializer_class = SODFCTransferSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "transfer_type", "status"]
    search_fields = ["transfer_number", "bank_name", "bank_reference"]
    ordering_fields = ["transfer_date", "amount", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()


class DisbursementViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Disbursement.objects.select_related(
        "organization", "purchase_order", "invoice", "shipment", "currency"
    ).all()
    serializer_class = DisbursementSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["organization", "category", "status"]
    search_fields = ["disbursement_number", "notes"]
    ordering_fields = ["disbursement_date", "amount", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        instance.delete()
