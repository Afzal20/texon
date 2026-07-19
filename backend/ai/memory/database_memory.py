from __future__ import annotations

from datetime import datetime

from ..domain.entities import ChatMessage, Conversation, MessageRole
from ..domain.interfaces import MemoryBackend
from ..models import ConversationLog, MessageLog


class DatabaseMemory(MemoryBackend):
    def __init__(self, max_history: int = 20):
        self._max_history = max_history

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        try:
            conv = ConversationLog.objects.get(conversation_id=conversation_id)
            messages = MessageLog.objects.filter(conversation=conv).order_by("created_at")[: self._max_history]
            return Conversation(
                id=conv.conversation_id,
                user_id=conv.user_id,
                messages=[self._to_domain(m) for m in messages],
                created_at=conv.created_at,
                updated_at=conv.updated_at,
            )
        except ConversationLog.DoesNotExist:
            return None

    def create_conversation(self, user_id: int) -> Conversation:
        conv = ConversationLog.objects.create(
            conversation_id=self._next_id(),
            user_id=user_id,
        )
        return Conversation(id=conv.conversation_id, user_id=user_id)

    def add_message(self, conversation_id: str, message: ChatMessage) -> None:
        try:
            conv = ConversationLog.objects.get(conversation_id=conversation_id)
            MessageLog.objects.create(
                conversation=conv,
                role=message.role.value,
                content=message.content,
                tool_call_id=message.tool_call_id or "",
                tool_name=message.tool_name or "",
            )
        except ConversationLog.DoesNotExist:
            pass

    def get_history(self, conversation_id: str, limit: int = 20) -> list[ChatMessage]:
        try:
            conv = ConversationLog.objects.get(conversation_id=conversation_id)
            messages = MessageLog.objects.filter(conversation=conv).order_by("created_at")[:limit]
            return [self._to_domain(m) for m in messages]
        except ConversationLog.DoesNotExist:
            return []

    def _to_domain(self, msg: MessageLog) -> ChatMessage:
        return ChatMessage(
            role=MessageRole(msg.role),
            content=msg.content,
            tool_call_id=msg.tool_call_id or None,
            tool_name=msg.tool_name or None,
        )

    def _next_id(self) -> str:
        import uuid
        return str(uuid.uuid4())[:8]
