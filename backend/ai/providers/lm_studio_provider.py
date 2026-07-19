from __future__ import annotations
from typing import Callable

from openai import OpenAI

from ..domain.entities import ChatMessage, ChatResult, MessageRole, ToolCall, ToolDef
from ..domain.interfaces import BaseLLMProvider


class LMStudioProvider(BaseLLMProvider):
    def __init__(self, config: dict):
        self._config = config
        self._client = OpenAI(
            base_url=config.get("base_url", "http://localhost:1234/v1"),
            api_key=config.get("api_key", "lm-studio"),
        )
        self._model = config.get("model", "openai-gpt-oss-20b-abliterated-uncensored-neo-imatrix")
        self._temperature = config.get("temperature", 0.1)
        self._max_tokens = config.get("max_tokens", 4096)
        self._timeout = config.get("timeout", 60)

    @property
    def name(self) -> str:
        return f"lm_studio/{self._model}"

    def _build_kwargs(self, messages: list[ChatMessage], tools: list[ToolDef] | None = None):
        openai_messages = [m.to_dict() for m in messages]
        kwargs = {
            "model": self._model,
            "messages": openai_messages,
            "temperature": self._temperature,
            "max_tokens": self._max_tokens,
            "timeout": self._timeout,
        }
        if tools:
            kwargs["tools"] = [_to_openai_tool(t) for t in tools]
            kwargs["tool_choice"] = "auto"
        return kwargs

    def chat(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDef] | None = None,
        user_id: int | None = None,
    ) -> ChatResult:
        kwargs = self._build_kwargs(messages, tools)
        response = self._client.chat.completions.create(**kwargs)
        return self._parse_response(response)

    def chat_stream(
        self,
        messages: list[ChatMessage],
        tools: list[ToolDef] | None = None,
        user_id: int | None = None,
        on_token: Callable[[str], None] | None = None,
    ) -> ChatResult:
        kwargs = self._build_kwargs(messages, tools)
        kwargs["stream"] = True
        kwargs["stream_options"] = {"include_usage": False}

        response = self._client.chat.completions.create(**kwargs)

        content_parts: list[str] = []
        tool_call_deltas: dict[int, dict] = {}
        finish_reason = "stop"

        for chunk in response:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta is None:
                continue

            if delta.content:
                content_parts.append(delta.content)
                if on_token:
                    on_token(delta.content)

            if delta.tool_calls:
                for tc_delta in delta.tool_calls:
                    idx = tc_delta.index
                    if idx not in tool_call_deltas:
                        tool_call_deltas[idx] = {"id": "", "function": {"name": "", "arguments": ""}}
                    d = tool_call_deltas[idx]
                    if tc_delta.id:
                        d["id"] = tc_delta.id
                    if tc_delta.function:
                        if tc_delta.function.name:
                            d["function"]["name"] += tc_delta.function.name
                        if tc_delta.function.arguments:
                            d["function"]["arguments"] += tc_delta.function.arguments

            if chunk.choices and chunk.choices[0].finish_reason:
                finish_reason = chunk.choices[0].finish_reason

        content = "".join(content_parts)
        tool_calls = []
        for idx in sorted(tool_call_deltas):
            d = tool_call_deltas[idx]
            import json
            try:
                args = json.loads(d["function"]["arguments"])
            except json.JSONDecodeError:
                args = {}
            tool_calls.append(ToolCall(id=d["id"], name=d["function"]["name"], arguments=args))

        message = ChatMessage(role=MessageRole.ASSISTANT, content=content, tool_calls=tool_calls)
        return ChatResult(message=message, tool_calls=tool_calls, finish_reason=finish_reason)

    def count_tokens(self, messages: list[ChatMessage]) -> int:
        total = sum(len(m.content) for m in messages if m.content)
        return total // 4  # rough estimate

    def _parse_response(self, response) -> ChatResult:
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
        message = ChatMessage(role=MessageRole.ASSISTANT, content=content, tool_calls=tool_calls)
        finish = choice.finish_reason or "stop"
        return ChatResult(message=message, tool_calls=tool_calls, finish_reason=finish)


def _to_openai_tool(td: ToolDef) -> dict:
    return {
        "type": "function",
        "function": {
            "name": td.name,
            "description": td.description,
            "parameters": td.parameters,
        },
    }
