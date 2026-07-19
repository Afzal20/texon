from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsPagination
from .models import PreCosting, CostSheet
from .serializers import PreCostingSerializer, CostSheetSerializer


class PreCostingViewSet(viewsets.ModelViewSet):
    queryset = PreCosting.objects.select_related(
        "organization", "buyer", "style"
    ).all()
    serializer_class = PreCostingSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["notes"]
    ordering_fields = ["cost_date", "created_at", "updated_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)


class CostSheetViewSet(viewsets.ModelViewSet):
    queryset = CostSheet.objects.select_related("organization", "style").all()
    serializer_class = CostSheetSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["notes"]
    ordering_fields = ["cost_date", "created_at", "updated_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)
