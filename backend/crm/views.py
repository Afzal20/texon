from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import BuyerCommunication, BuyerProfitability, OrderAmendmentHistory
from .serializers import (
    BuyerCommunicationSerializer,
    BuyerProfitabilitySerializer,
    OrderAmendmentHistorySerializer,
)


class BuyerCommunicationViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = BuyerCommunication.objects.select_related("organization", "buyer").all()
    serializer_class = BuyerCommunicationSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["communication_type", "status", "buyer"]
    search_fields = ["subject", "content", "contact_person", "created_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user.get_full_name() or self.request.user.email,
        )

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete communications.")
        return super().destroy(request, *args, **kwargs)


class BuyerProfitabilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BuyerProfitability.objects.select_related("buyer").all()
    serializer_class = BuyerProfitabilitySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["buyer"]
    search_fields = []

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(buyer__organization__is_active=True)
        return qs


class OrderAmendmentHistoryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = OrderAmendmentHistory.objects.select_related("purchase_order").all()
    serializer_class = OrderAmendmentHistorySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["purchase_order"]
    search_fields = ["reason", "amended_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(purchase_order__organization__is_active=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            amended_by=self.request.user.get_full_name() or self.request.user.email,
        )

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete amendment history.")
        return super().destroy(request, *args, **kwargs)
