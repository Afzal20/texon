from __future__ import annotations

from openai import OpenAI

from ..domain.entities import ChatMessage, ChatResult, MessageRole, ToolCall, ToolDef
from ..domain.interfaces import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, config: dict):
        self._config = config
        self._client = OpenAI(api_key=config.get("api_key"))
        self._model = config.get("model", "gpt-4o-mini")
        self._temperature = config.get("temperature", 0.1)
        self._max_tokens = config.get("max_tokens", 4096)

    @property
    def name(self) -> str:
        return f"openai/{self._model}"

    def chat(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDef] | None = None,
        user_id: int | None = None,
    ) -> ChatResult:
        openai_messages = [m.to_dict() for m in messages]
        kwargs = {
            "model": self._model,
            "messages": openai_messages,
            "temperature": self._temperature,
            "max_tokens": self._max_tokens,
        }
        if tools:
            kwargs["tools"] = [_to_openai_tool(t) for t in tools]
            kwargs["tool_choice"] = "auto"

        response = self._client.chat.completions.create(**kwargs)
        choice = response.choices[0]

        tool_calls = []
        if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
            for tc in choice.message.tool_calls:
                import json
                try:
                    args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    args = {}
                tool_calls.append(ToolCall(id=tc.id, name=tc.function.name, arguments=args))

        content = choice.message.content or ""
        message = ChatMessage(role=MessageRole.ASSISTANT, content=content)
        finish = choice.finish_reason or "stop"

        return ChatResult(message=message, tool_calls=tool_calls, finish_reason=finish)

    def count_tokens(self, messages: list[ChatMessage]) -> int:
        total = sum(len(m.content) for m in messages if m.content)
        return total // 4


def _to_openai_tool(td: ToolDef) -> dict:
    return {
        "type": "function",
        "function": {
            "name": td.name,
            "description": td.description,
            "parameters": td.parameters,
        },
    }
