from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    NotificationViewSet, NotificationPreferenceViewSet,
    EmailTemplateViewSet, SMSTemplateViewSet, AlertRuleViewSet
)

router = DefaultRouter()
router.register(r'messages', NotificationViewSet, basename='notification')
router.register(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')
router.register(r'email-templates', EmailTemplateViewSet, basename='email-template')
router.register(r'sms-templates', SMSTemplateViewSet, basename='sms-template')
router.register(r'alert-rules', AlertRuleViewSet, basename='alert-rule')

urlpatterns = [
    path('', include(router.urls)),
]
