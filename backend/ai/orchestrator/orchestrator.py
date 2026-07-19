from __future__ import annotations

from typing import Any, Callable

from ..domain.entities import (
    ChatMessage,
    ChatResult,
    MessageRole,
    ToolCall,
)
from ..domain.interfaces import BaseLLMProvider, MemoryBackend
from ..prompts.builder import PromptBuilder
from ..registry.skill_registry import SkillRegistry
from ..tools.tool_executor import ToolExecutor


class Orchestrator:
    def __init__(
        self,
        registry: SkillRegistry,
        provider: BaseLLMProvider,
        memory: MemoryBackend,
        max_tool_rounds: int = 10,
    ):
        self._registry = registry
        self._provider = provider
        self._memory = memory
        self._executor = ToolExecutor(registry)
        self._builder = PromptBuilder(registry)
        self._max_tool_rounds = max_tool_rounds

    def _resolve_conversation(self, conversation_id: str | None, user_id: int) -> tuple[str, list[ChatMessage]]:
        if not conversation_id:
            conv = self._memory.create_conversation(user_id=user_id)
            conversation_id = conv.id
        else:
            conv = self._memory.get_conversation(conversation_id)
            if not conv:
                conv = self._memory.create_conversation(user_id=user_id)
                conversation_id = conv.id
        history = self._memory.get_history(conversation_id, limit=20)
        return conversation_id, history

    def chat(
        self,
        user_message: str,
        conversation_id: str | None = None,
        user: Any = None,
    ) -> ChatResult:
        conversation_id, history = self._resolve_conversation(
            conversation_id, user.id if user else 0
        )
        system_msg = self._builder.build_system_message(user)

        messages = [system_msg]
        messages.extend(history)
        messages.append(ChatMessage(role=MessageRole.USER, content=user_message))
        self._memory.add_message(conversation_id, messages[-1])

        result = self._run_tool_loop(messages, user)
        final_msg = result.message if result else ChatMessage(role=MessageRole.ASSISTANT, content="")
        self._memory.add_message(conversation_id, final_msg)
        return ChatResult(
            conversation_id=conversation_id,
            message=final_msg,
            tool_calls=final_msg.tool_calls or [],
        )

    def chat_stream(
        self,
        user_message: str,
        conversation_id: str | None = None,
        user: Any = None,
        on_token: Callable[[str], None] | None = None,
        on_tool_call: Callable[[str, dict], None] | None = None,
    ) -> ChatResult:
        conversation_id, history = self._resolve_conversation(
            conversation_id, user.id if user else 0
        )
        system_msg = self._builder.build_system_message(user)

        messages = [system_msg]
        messages.extend(history)
        messages.append(ChatMessage(role=MessageRole.USER, content=user_message))
        self._memory.add_message(conversation_id, messages[-1])

        tool_rounds = 0
        result: ChatResult | None = None
        while tool_rounds < self._max_tool_rounds:
            result = self._provider.chat_stream(
                messages, tools=self._registry.all_tools, on_token=on_token,
            )
            messages.append(result.message)

            if not result.tool_calls:
                break

            for tc in result.tool_calls:
                if on_tool_call:
                    on_tool_call(tc.name, tc.arguments)
                tool_result = self._executor.execute(tc, user_id=user.id if user else None)
                messages.append(tool_result)
                self._memory.add_message(conversation_id, tool_result)

            tool_rounds += 1

        final_msg = result.message if result else ChatMessage(role=MessageRole.ASSISTANT, content="")
        self._memory.add_message(conversation_id, final_msg)
        return ChatResult(
            conversation_id=conversation_id,
            message=final_msg,
            tool_calls=final_msg.tool_calls or [],
        )

    def _run_tool_loop(self, messages: list[ChatMessage], user: Any) -> ChatResult | None:
        tool_rounds = 0
        result: ChatResult | None = None
        while tool_rounds < self._max_tool_rounds:
            result = self._provider.chat(messages, tools=self._registry.all_tools)
            messages.append(result.message)

            if not result.tool_calls:
                break

            for tc in result.tool_calls:
                tool_result = self._executor.execute(tc, user_id=user.id if user else None)
                messages.append(tool_result)

            tool_rounds += 1
        return result

    def reset_conversation(self, conversation_id: str) -> None:
        pass
