from django.contrib import admin
from .models import Notification, NotificationPreference, EmailTemplate, SMSTemplate, AlertRule

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_read', 'created_at')
    search_fields = ('title', 'user__email')
    list_filter = ('is_read', 'created_at')

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_enabled', 'sms_enabled', 'in_app_enabled')
    search_fields = ('user__email',)

@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'organization')
    search_fields = ('name', 'subject')
    list_filter = ('organization',)

@admin.register(SMSTemplate)
class SMSTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ('rule_name', 'metric_to_monitor', 'threshold_value', 'comparison_operator', 'is_active', 'organization')
    search_fields = ('rule_name', 'metric_to_monitor')
    list_filter = ('organization', 'is_active')
