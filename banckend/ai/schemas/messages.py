"""Typed message and tool-call structures used by the AI orchestrator."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

Role = Literal['system', 'developer', 'user', 'assistant', 'tool']


@dataclass(slots=True)
class ConversationMessage:
    """Single message in the orchestrator conversation history."""

    role: Role
    content: str | None = None
    name: str | None = None
    tool_call_id: str | None = None
    tool_calls: list[dict[str, Any]] = field(default_factory=list)

    def to_openai_dict(self) -> dict[str, Any]:
        """Convert the message into the OpenAI chat-completions wire format."""

        payload: dict[str, Any] = {'role': self.role}
        if self.content is not None:
            payload['content'] = self.content
        if self.name is not None:
            payload['name'] = self.name
        if self.tool_call_id is not None:
            payload['tool_call_id'] = self.tool_call_id
        if self.tool_calls:
            payload['tool_calls'] = self.tool_calls
        return payload


@dataclass(slots=True)
class ToolInvocation:
    """Normalized tool-call request emitted by the model."""

    name: str
    arguments: dict[str, Any]
    call_id: str | None = None


@dataclass(slots=True)
class OrchestrationResult:
    """Final orchestrator result returned to application callers."""

    content: str
    tool_calls: list[ToolInvocation] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
