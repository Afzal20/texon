from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Callable

from .entities import ChatMessage, ChatResult, Conversation, SkillResult, ToolCall, ToolDef


class BaseLLMProvider(ABC):
    @abstractmethod
    def chat(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDef] | None = None,
        user_id: int | None = None,
    ) -> ChatResult:
        ...

    def chat_stream(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDef] | None = None,
        user_id: int | None = None,
        on_token: Callable[[str], None] | None = None,
    ) -> ChatResult:
        return self.chat(messages, tools=tools, user_id=user_id)

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def count_tokens(self, messages: list[ChatMessage]) -> int: ...


class BaseSkill(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def description(self) -> str: ...

    @property
    @abstractmethod
    def tool_definitions(self) -> list[ToolDef]: ...

    @abstractmethod
    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult: ...


class MemoryBackend(ABC):
    @abstractmethod
    def get_conversation(self, conversation_id: str) -> Conversation | None: ...

    @abstractmethod
    def create_conversation(self, user_id: int) -> Conversation: ...

    @abstractmethod
    def add_message(self, conversation_id: str, message: ChatMessage) -> None: ...

    @abstractmethod
    def get_history(self, conversation_id: str, limit: int = 20) -> list[ChatMessage]: ...
