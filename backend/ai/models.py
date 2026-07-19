from __future__ import annotations

from django.conf import settings
from django.db import models


class ConversationLog(models.Model):
    conversation_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_conversations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "AI Conversation"
        verbose_name_plural = "AI Conversations"

    def __str__(self) -> str:
        return f"{self.conversation_id} ({self.user.email})"


class MessageLog(models.Model):
    conversation = models.ForeignKey(
        ConversationLog, on_delete=models.CASCADE, related_name="messages"
    )
    role = models.CharField(max_length=16)
    content = models.TextField(blank=True, default="")
    tool_call_id = models.CharField(max_length=64, blank=True, default="")
    tool_name = models.CharField(max_length=128, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "AI Message"
        verbose_name_plural = "AI Messages"

    def __str__(self) -> str:
        return f"[{self.role}] {self.content[:60]}"
