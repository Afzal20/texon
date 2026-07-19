from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import SubcontractOrder, SubcontractTracking
from .serializers import SubcontractOrderSerializer, SubcontractTrackingSerializer


class SubcontractOrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SubcontractOrder.objects.all()
    serializer_class = SubcontractOrderSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "style", "purchase_order", "process", "status"]
    search_fields = ["order_number", "subcontractor_name", "notes"]

    def get_queryset(self):
        qs = self.queryset.select_related("organization", "style", "purchase_order")
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()


class SubcontractTrackingViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SubcontractTracking.objects.all()
    serializer_class = SubcontractTrackingSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["subcontract_order", "status"]
    search_fields = ["status", "remarks"]

    def get_queryset(self):
        qs = self.queryset.select_related("subcontract_order")
        if not self.request.user.is_staff:
            qs = qs.filter(subcontract_order__organization__is_active=True)
        return qs

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff members can delete records.")
        instance.delete()
