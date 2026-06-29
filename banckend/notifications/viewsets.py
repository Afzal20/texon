from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from skeleton.pagination import ProductionPagination
from skeleton.permissions import IsOrganizationMember

from .models import (
    Notification, NotificationPreference, EmailTemplate,
    SMSTemplate, AlertRule
)
from .serializers import (
    NotificationSerializer, NotificationPreferenceSerializer,
    EmailTemplateSerializer, SMSTemplateSerializer, AlertRuleSerializer
)
from .filters import NotificationFilter

class BaseNotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NotificationFilter

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsOrganizationMember]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EmailTemplateViewSet(BaseNotificationViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer

class SMSTemplateViewSet(BaseNotificationViewSet):
    queryset = SMSTemplate.objects.all()
    serializer_class = SMSTemplateSerializer

class AlertRuleViewSet(BaseNotificationViewSet):
    queryset = AlertRule.objects.all()
    serializer_class = AlertRuleSerializer
