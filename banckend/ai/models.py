"""Persistence models for AI conversations and audit events."""

from __future__ import annotations

from django.conf import settings
from django.db import models
from auditlog.registry import auditlog


class AIConversation(models.Model):
    """Conversation thread owned by a user within an organization."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    title = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title or f'AI conversation #{self.pk}'


class AIConversationMessage(models.Model):
    """Persisted message within an AI conversation thread."""

    ROLE_CHOICES = [
        ('system', 'System'),
        ('developer', 'Developer'),
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('tool', 'Tool'),
    ]

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField(blank=True, default='')
    tool_name = models.CharField(max_length=255, blank=True, default='')
    tool_call_id = models.CharField(max_length=255, blank=True, default='')
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.conversation_id}:{self.role}'


class AIAuditEvent(models.Model):
    """Auditable record of every AI action and tool execution."""

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='audit_events', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_audit_events')
    action = models.CharField(max_length=255)
    tool_name = models.CharField(max_length=255, blank=True, default='')
    request_payload = models.JSONField(blank=True, default=dict)
    response_payload = models.JSONField(blank=True, default=dict)
    success = models.BooleanField(default=True)
    error_text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.action} ({"ok" if self.success else "error"})'


auditlog.register(AIConversation)
auditlog.register(AIConversationMessage)
auditlog.register(AIAuditEvent)
