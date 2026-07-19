from __future__ import annotations

from datetime import datetime
from typing import Any

from ..domain.entities import ChatMessage, Conversation, MessageRole
from ..domain.interfaces import MemoryBackend


class BufferMemory(MemoryBackend):
    def __init__(self, max_history: int = 20):
        self._conversations: dict[str, Conversation] = {}
        self._max_history = max_history

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self._conversations.get(conversation_id)

    def create_conversation(self, user_id: int) -> Conversation:
        conv = Conversation(id=self._next_id(), user_id=user_id)
        self._conversations[conv.id] = conv
        return conv

    def add_message(self, conversation_id: str, message: ChatMessage) -> None:
        conv = self._conversations.get(conversation_id)
        if conv:
            conv.messages.append(message)
            conv.updated_at = datetime.utcnow()
            # Trim to max_history (keep system prompt + recent pairs)
            if len(conv.messages) > self._max_history + 1:
                system = [m for m in conv.messages if m.role == MessageRole.SYSTEM]
                recent = [m for m in conv.messages if m.role != MessageRole.SYSTEM][-(self._max_history):]
                conv.messages = system + recent

    def get_history(self, conversation_id: str, limit: int = 20) -> list[ChatMessage]:
        conv = self._conversations.get(conversation_id)
        if not conv:
            return []
        return conv.messages[-limit:]

    def _next_id(self) -> str:
        import uuid
        return str(uuid.uuid4())[:8]
