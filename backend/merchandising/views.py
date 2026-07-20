from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import (
    BudgetDemandAssessment,
    BuyerEnquiry,
    DevelopmentMonitoring,
    IeSuggestion,
    ProcessWiseTarget,
    ProductionDowntime,
    PurchaseOrder,
    SMVRecord,
    SampleOrder,
    SkillInventory,
    Style,
)
from .serializers import (
    BudgetDemandAssessmentSerializer,
    BuyerEnquirySerializer,
    DevelopmentMonitoringSerializer,
    IeSuggestionSerializer,
    ProcessWiseTargetSerializer,
    ProductionDowntimeSerializer,
    PurchaseOrderSerializer,
    SMVRecordSerializer,
    SampleOrderSerializer,
    SkillInventorySerializer,
    StyleSerializer,
)


class StyleViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Style.objects.select_related("organization", "buyer").all()
    serializer_class = StyleSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["category", "is_active", "buyer"]
    search_fields = ["name", "style_number"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class BuyerEnquiryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = BuyerEnquiry.objects.select_related("organization", "buyer", "style").all()
    serializer_class = BuyerEnquirySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "buyer", "style"]
    search_fields = ["notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class PurchaseOrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = PurchaseOrder.objects.select_related("organization", "buyer", "style").all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "buyer", "style"]
    search_fields = ["po_number", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class SampleOrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SampleOrder.objects.select_related("organization", "buyer", "style").all()
    serializer_class = SampleOrderSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["sample_type", "status", "buyer", "style"]
    search_fields = ["notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class SMVRecordViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SMVRecord.objects.select_related("style").all()
    serializer_class = SMVRecordSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["style"]
    search_fields = ["calculated_by"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(style__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class DevelopmentMonitoringViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = DevelopmentMonitoring.objects.select_related("style").all()
    serializer_class = DevelopmentMonitoringSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "stage", "style"]
    search_fields = ["supplier", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(style__organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class BudgetDemandAssessmentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = BudgetDemandAssessment.objects.select_related("organization", "buyer").all()
    serializer_class = BudgetDemandAssessmentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["buyer", "confidence"]
    search_fields = ["buyer__name", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class IeSuggestionViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = IeSuggestion.objects.select_related("organization", "production_line", "style").all()
    serializer_class = IeSuggestionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "production_line"]
    search_fields = ["operation", "description"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class SkillInventoryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SkillInventory.objects.select_related("organization", "employee", "production_line").all()
    serializer_class = SkillInventorySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["skill_level", "multi_skill", "production_line"]
    search_fields = ["operator_name", "skill_name", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class ProductionDowntimeViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProductionDowntime.objects.select_related("organization", "production_line", "style").all()
    serializer_class = ProductionDowntimeSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "cause", "production_line"]
    search_fields = ["cause", "description"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)


class ProcessWiseTargetViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProcessWiseTarget.objects.select_related("organization").all()
    serializer_class = ProcessWiseTargetSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["status", "process_name"]
    search_fields = ["process_name", "notes"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete.")
        return super().destroy(request, *args, **kwargs)
