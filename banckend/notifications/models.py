from django.db import models
from auditlog.registry import auditlog

class Notification(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.email}"

class NotificationPreference(models.Model):
    user = models.OneToOneField('users.CustomUser', on_delete=models.CASCADE, related_name="notification_preferences")
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"Prefs: {self.user.email}"

class EmailTemplate(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="email_templates")
    name = models.CharField(max_length=100)  # Password Reset Template
    subject = models.CharField(max_length=255)
    body_html = models.TextField()

    def __str__(self):
        return self.name

class SMSTemplate(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="sms_templates")
    name = models.CharField(max_length=100)
    message_text = models.TextField()

    def __str__(self):
        return self.name

class AlertRule(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="alert_rules")
    rule_name = models.CharField(max_length=255)  # Daily Defect Alert Threshold
    metric_to_monitor = models.CharField(max_length=100)  # e.g., defect_rate
    threshold_value = models.DecimalField(max_digits=10, decimal_places=2)
    comparison_operator = models.CharField(max_length=10, default=">")  # >, <, =
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Rule: {self.rule_name}"

auditlog.register(Notification)
auditlog.register(NotificationPreference)
auditlog.register(EmailTemplate)
auditlog.register(SMSTemplate)
auditlog.register(AlertRule)
