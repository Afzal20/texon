from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import DefectCategory, EndLineQC, FabricInspection, FinalInspection, InlineQC, RejectionReport
from .serializers import (
    DefectCategorySerializer,
    EndLineQCSerializer,
    FabricInspectionSerializer,
    FinalInspectionSerializer,
    InlineQCSerializer,
    RejectionReportSerializer,
)


class DefectCategoryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = DefectCategory.objects.select_related("organization").all()
    serializer_class = DefectCategorySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["is_active"]
    search_fields = ["name", "code", "description"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete defect categories.")
        return super().destroy(request, *args, **kwargs)


class FabricInspectionViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = FabricInspection.objects.select_related("organization", "defect_category").all()
    serializer_class = FabricInspectionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "defect_category"]
    search_fields = ["fabric_received_from", "supplier", "inspected_by", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete fabric inspections.")
        return super().destroy(request, *args, **kwargs)


class InlineQCViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = InlineQC.objects.select_related(
        "production_order", "defect_category"
    ).all()
    serializer_class = InlineQCSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "production_line", "defect_category"]
    search_fields = ["production_line", "defect_description", "action_taken", "checked_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(production_order__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete inline QC records.")
        return super().destroy(request, *args, **kwargs)


class EndLineQCViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = EndLineQC.objects.select_related(
        "production_order", "defect_category"
    ).all()
    serializer_class = EndLineQCSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "defect_category"]
    search_fields = ["remarks", "checked_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(production_order__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete end line QC records.")
        return super().destroy(request, *args, **kwargs)


class RejectionReportViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = RejectionReport.objects.select_related(
        "production_order", "defect_category"
    ).all()
    serializer_class = RejectionReportSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["stage", "defect_category"]
    search_fields = ["defect_details", "corrective_action", "reported_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(production_order__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete rejection reports.")
        return super().destroy(request, *args, **kwargs)


class FinalInspectionViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = FinalInspection.objects.select_related("production_order").all()
    serializer_class = FinalInspectionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status"]
    search_fields = ["aql_level", "notes", "inspected_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(production_order__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete final inspections.")
        return super().destroy(request, *args, **kwargs)
