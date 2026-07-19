from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import QuotationAnalysis, RawMaterialBooking, RawMaterialRequisition, Supplier
from .serializers import (
    QuotationAnalysisSerializer,
    RawMaterialBookingSerializer,
    RawMaterialRequisitionSerializer,
    SupplierSerializer,
)


class SupplierViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Supplier.objects.select_related("organization").all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["supplier_type", "is_active"]
    search_fields = ["name", "code", "contact_person", "email", "phone"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete suppliers.")
        return super().destroy(request, *args, **kwargs)


class RawMaterialRequisitionViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = RawMaterialRequisition.objects.select_related("organization").all()
    serializer_class = RawMaterialRequisitionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["item_type", "status"]
    search_fields = ["requisition_number", "purpose", "requested_by", "approved_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete requisitions.")
        return super().destroy(request, *args, **kwargs)


class RawMaterialBookingViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = RawMaterialBooking.objects.select_related("organization", "supplier").all()
    serializer_class = RawMaterialBookingSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["item_type", "status", "supplier"]
    search_fields = ["booking_number", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete bookings.")
        return super().destroy(request, *args, **kwargs)


class QuotationAnalysisViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = QuotationAnalysis.objects.select_related("organization", "supplier").all()
    serializer_class = QuotationAnalysisSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "supplier"]
    search_fields = ["item_type", "delivery_terms", "payment_terms", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete quotation analyses.")
        return super().destroy(request, *args, **kwargs)
