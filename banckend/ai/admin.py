"""Admin registrations for AI conversation and audit records."""

from django.contrib import admin

from ai.models import AIAuditEvent, AIConversation, AIConversationMessage


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at', 'updated_at')
    search_fields = ('title', 'user__email')
    list_filter = ('created_at', 'updated_at')


@admin.register(AIConversationMessage)
class AIConversationMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'role', 'tool_name', 'created_at')
    search_fields = ('content', 'tool_name', 'conversation__title')
    list_filter = ('role', 'created_at')


@admin.register(AIAuditEvent)
class AIAuditEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'tool_name', 'user', 'success', 'created_at')
    search_fields = ('action', 'tool_name', 'error_text')
    list_filter = ('success', 'created_at')
