from __future__ import annotations

from ..domain.entities import ChatMessage, MessageRole, SkillResult, ToolCall
from ..registry.skill_registry import SkillRegistry


class ToolExecutor:
    def __init__(self, registry: SkillRegistry):
        self._registry = registry

    def execute(self, tool_call: ToolCall, user_id: int | None = None) -> ChatMessage:
        result = self._registry.execute(tool_call.name, tool_call.arguments, user_id=user_id)
        content = str(result.data) if result.success else f"Error: {result.error}"
        return ChatMessage(
            role=MessageRole.TOOL,
            content=content,
            tool_call_id=tool_call.id,
            name=tool_call.name,
        )

    def execute_many(
        self, tool_calls: list[ToolCall], user_id: int | None = None
    ) -> list[ChatMessage]:
        return [self.execute(tc, user_id=user_id) for tc in tool_calls]
