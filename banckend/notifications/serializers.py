from rest_framework import serializers
from .models import (
    Notification, NotificationPreference, EmailTemplate,
    SMSTemplate, AlertRule
)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'email_enabled', 'sms_enabled', 'in_app_enabled']
        read_only_fields = ['id', 'user']

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = ['id', 'organization', 'name', 'subject', 'body_html']
        read_only_fields = ['id', 'organization']

class SMSTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSTemplate
        fields = ['id', 'organization', 'name', 'message_text']
        read_only_fields = ['id', 'organization']

class AlertRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertRule
        fields = [
            'id', 'organization', 'rule_name', 'metric_to_monitor',
            'threshold_value', 'comparison_operator', 'is_active'
        ]
        read_only_fields = ['id', 'organization']
