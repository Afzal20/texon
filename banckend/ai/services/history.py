"""Conversation history repository for the AI app."""

from __future__ import annotations

from typing import Any

from django.core.exceptions import PermissionDenied

from ai.models import AIConversation, AIConversationMessage

# ── Safety constants ──────────────────────────────────────────────
MAX_LOADED_MESSAGES = 200  # Cap messages loaded into memory


class ConversationHistoryService:
    """Persist and load conversation history for an AI chat session."""

    def get_or_create_conversation(
        self,
        user: Any,
        title: str = '',
        conversation_id: int | None = None,
    ) -> AIConversation:
        """Return an existing conversation (owned by the user) or create a new one.

        When *conversation_id* is provided, ownership is validated so users
        cannot access conversations belonging to other accounts.
        """

        if conversation_id is not None:
            try:
                conversation = AIConversation.objects.get(pk=conversation_id)
            except AIConversation.DoesNotExist:
                # Fall through and create a new conversation below.
                pass
            else:
                if conversation.user_id != user.pk:
                    raise PermissionDenied('You do not have access to this conversation.')
                return conversation

        return AIConversation.objects.create(user=user, title=title or '')

    def append_message(
        self,
        conversation: AIConversation,
        role: str,
        content: str = '',
        tool_name: str = '',
        tool_call_id: str = '',
        metadata: dict[str, Any] | None = None,
    ) -> AIConversationMessage:
        """Persist a single chat message."""

        return AIConversationMessage.objects.create(
            conversation=conversation,
            role=role,
            content=content,
            tool_name=tool_name,
            tool_call_id=tool_call_id,
            metadata=metadata or {},
        )

    def load_messages(
        self,
        conversation: AIConversation,
        limit: int = MAX_LOADED_MESSAGES,
    ) -> list[dict[str, Any]]:
        """Return conversation messages in OpenAI-compatible shape.

        Only the most recent *limit* messages are returned to avoid
        unbounded memory consumption.
        """

        qs = conversation.messages.order_by('created_at')
        total = qs.count()
        if total > limit:
            qs = qs[total - limit:]

        return [
            {
                'role': message.role,
                'content': message.content,
                'name': message.tool_name or None,
                'tool_call_id': message.tool_call_id or None,
                'metadata': message.metadata,
            }
            for message in qs
        ]
