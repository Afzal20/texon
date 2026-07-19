from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import LC, Shipment, Invoice, BillOfExchange
from .serializers import (
    LCSerializer, ShipmentSerializer,
    InvoiceSerializer, BillOfExchangeSerializer,
)


class LCViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LC.objects.all()
    serializer_class = LCSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "buyer", "purchase_order", "lc_type", "status"]
    search_fields = ["lc_number", "issuing_bank", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "buyer", "purchase_order", "currency")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class ShipmentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "purchase_order", "buyer", "status"]
    search_fields = [
        "shipment_number", "port_of_loading", "port_of_discharge",
        "forwarder", "container_number", "notes",
    ]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "purchase_order", "buyer")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class InvoiceViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "purchase_order", "buyer", "status"]
    search_fields = ["invoice_number", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "purchase_order", "buyer", "currency")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class BillOfExchangeViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = BillOfExchange.objects.all()
    serializer_class = BillOfExchangeSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "buyer", "status", "currency"]
    search_fields = ["bill_number", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "buyer", "currency")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()
