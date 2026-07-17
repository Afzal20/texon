"""Prompt construction and conversation history management for the AI app."""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Any

from ai.schemas.messages import ConversationMessage


@dataclass(frozen=True, slots=True)
class PromptTemplate:
    """Prompts used to keep the local assistant constrained and auditable."""

    system_prompt: str
    developer_prompt: str


class PromptManager:
    """Builds the model prompt and tracks the conversation history shape."""

    def __init__(self, template: PromptTemplate | None = None) -> None:
        self._template = template or PromptTemplate(
            system_prompt=(
                'You are an internal ERP assistant for a garment manufacturing system. '
                'You must not generate SQL, GraphQL queries, or HTTP requests. '
                'You may only complete user requests by asking approved Python tools to do work.'
            ),
            developer_prompt=(
                'Rules: use only approved tools; never invent database access; '
                'if a tool is unavailable, explain the limitation plainly; '
                'always prefer concise, operational answers.'
            ),
        )

    def build_system_messages(
        self,
        tool_descriptions: Iterable[str],
    ) -> list[ConversationMessage]:
        """Assemble the fixed prompt messages that anchor the assistant."""

        tools_text = '\n'.join(f'- {description}' for description in tool_descriptions)
        return [
            ConversationMessage(role='system', content=self._template.system_prompt),
            ConversationMessage(
                role='developer',
                content='\n'.join([self._template.developer_prompt, 'Available tools:', tools_text]),
            ),
        ]

    def normalize_history(
        self,
        history: Iterable[ConversationMessage | dict[str, Any]],
    ) -> list[ConversationMessage]:
        """Normalize stored conversation items into typed messages."""

        normalized: list[ConversationMessage] = []
        for item in history:
            if isinstance(item, ConversationMessage):
                normalized.append(item)
                continue
            normalized.append(
                ConversationMessage(
                    role=item['role'],
                    content=item.get('content'),
                    name=item.get('name'),
                    tool_call_id=item.get('tool_call_id'),
                    tool_calls=item.get('tool_calls', []),
                )
            )
        return normalized
