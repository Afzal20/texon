from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any


class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


@dataclass
class ChatMessage:
    role: MessageRole
    content: str
    tool_calls: list[ToolCall] | None = None
    tool_call_id: str | None = None
    tool_name: str | None = None
    name: str | None = None

    def to_dict(self) -> dict:
        d = {"role": self.role.value, "content": self.content}
        if self.tool_call_id:
            d["tool_call_id"] = self.tool_call_id
        if self.name:
            d["name"] = self.name
        return d


@dataclass
class ToolDef:
    name: str
    description: str
    parameters: dict  # JSON Schema


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict


@dataclass
class SkillResult:
    success: bool
    data: Any = None
    error: str | None = None

    def to_tool_message(self, tool_call_id: str) -> ChatMessage:
        content = str(self.data) if self.success else f"Error: {self.error}"
        return ChatMessage(
            role=MessageRole.TOOL,
            content=content,
            tool_call_id=tool_call_id,
            name=self.data.get("_tool_name") if isinstance(self.data, dict) else None,
        )


@dataclass
class ChatResult:
    message: ChatMessage
    tool_calls: list[ToolCall] = field(default_factory=list)
    finish_reason: str = "stop"
    conversation_id: str | None = None


@dataclass
class Conversation:
    id: str
    user_id: int
    messages: list[ChatMessage] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
