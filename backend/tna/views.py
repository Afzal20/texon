from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsPagination
from .models import Task, JobOrder, Timeline, AlarmNotification
from .serializers import (
    TaskSerializer,
    JobOrderSerializer,
    TimelineSerializer,
    AlarmNotificationSerializer,
)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related(
        "organization", "parent_task", "purchase_order", "style"
    ).all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "assigned_to"]
    search_fields = ["title", "description", "notes"]
    ordering_fields = ["start_date", "end_date", "created_at", "priority"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)


class JobOrderViewSet(viewsets.ModelViewSet):
    queryset = JobOrder.objects.select_related("organization", "task").all()
    serializer_class = JobOrderSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "assigned_department"]
    search_fields = ["job_order_number", "description", "notes"]
    ordering_fields = ["start_date", "end_date", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)


class TimelineViewSet(viewsets.ModelViewSet):
    queryset = Timeline.objects.select_related(
        "organization", "purchase_order", "style"
    ).all()
    serializer_class = TimelineSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "milestone"]
    search_fields = ["milestone", "notes"]
    ordering_fields = ["planned_date", "actual_date", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)


class AlarmNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AlarmNotification.objects.select_related("organization", "task").all()
    serializer_class = AlarmNotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["alarm_type", "status"]
    search_fields = ["recipient", "message"]
    ordering_fields = ["scheduled_at", "sent_at", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs
