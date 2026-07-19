from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsPagination
from .models import GroupCompany, MultiCompany, LocationBasedOperation
from .serializers import (
    GroupCompanySerializer,
    MultiCompanySerializer,
    LocationBasedOperationSerializer,
)


class GroupCompanyViewSet(viewsets.ModelViewSet):
    queryset = GroupCompany.objects.select_related("organization", "base_currency").all()
    serializer_class = GroupCompanySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "country"]
    search_fields = ["name", "code", "registration_number"]
    ordering_fields = ["name", "code", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)


class MultiCompanyViewSet(viewsets.ModelViewSet):
    queryset = MultiCompany.objects.select_related("parent_company", "currency").all()
    serializer_class = MultiCompanySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "country"]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "code", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(parent_company__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)


class LocationBasedOperationViewSet(viewsets.ModelViewSet):
    queryset = LocationBasedOperation.objects.select_related(
        "multi_company", "location"
    ).all()
    serializer_class = LocationBasedOperationSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["operation_type", "is_active"]
    search_fields = []
    ordering_fields = ["created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(multi_company__parent_company__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)
