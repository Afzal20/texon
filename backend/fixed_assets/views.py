from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import AssetCategory, DepreciationSchedule, FixedAsset
from .serializers import AssetCategorySerializer, DepreciationScheduleSerializer, FixedAssetSerializer


class AssetCategoryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = AssetCategory.objects.select_related("organization").all()
    serializer_class = AssetCategorySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "is_active"]
    search_fields = ["name", "code"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete asset categories.")
        return super().destroy(request, *args, **kwargs)


class FixedAssetViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = FixedAsset.objects.select_related("organization", "category", "location").all()
    serializer_class = FixedAssetSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["organization", "category", "location", "status"]
    search_fields = ["asset_code", "name", "description", "assigned_to"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete fixed assets.")
        return super().destroy(request, *args, **kwargs)


class DepreciationScheduleViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = DepreciationSchedule.objects.select_related("fixed_asset").all()
    serializer_class = DepreciationScheduleSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["fixed_asset", "period"]
    search_fields = []

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(fixed_asset__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete depreciation schedules.")
        return super().destroy(request, *args, **kwargs)
