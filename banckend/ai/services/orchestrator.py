"""AI orchestration service that coordinates prompt, tools, and LM Studio."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any

from ai.prompts.manager import PromptManager
from ai.schemas.messages import ConversationMessage, OrchestrationResult, ToolInvocation
from ai.services.audit import audit_ai_action
from ai.services.lm_studio_client import LMStudioClient
from ai.tools.base import ToolContext
from ai.tools.registry import ToolNotFoundError, ToolRegistry, tool_registry

logger = logging.getLogger(__name__)

# ── Safety constants ──────────────────────────────────────────────
MAX_TOOL_ITERATIONS = 5  # Prevent infinite tool-call loops


def _safe_parse_arguments(raw_arguments: str) -> dict[str, Any]:
    """Parse tool-call arguments JSON, returning a descriptive error dict on failure."""

    try:
        parsed = json.loads(raw_arguments or '{}')
        if not isinstance(parsed, dict):
            return {'_error': 'Expected a JSON object for tool arguments.'}
        return parsed
    except (json.JSONDecodeError, TypeError) as exc:
        logger.warning('Malformed tool arguments from model: %s', exc)
        return {'_error': f'Malformed tool arguments: {exc}'}


def _execute_tool_safely(
    registry: ToolRegistry,
    tool_name: str,
    context: ToolContext,
    arguments: dict[str, Any],
) -> tuple[dict[str, Any], bool]:
    """Execute a tool by name, returning ``(result, success)``.

    Never raises — all errors are converted into a structured error dict
    so the orchestrator can feed them back to the model.
    """

    if '_error' in arguments:
        return arguments, False

    try:
        tool_class = registry.get(tool_name)
    except ToolNotFoundError as exc:
        logger.warning('Model requested unknown tool: %s', tool_name)
        return {'error': str(exc)}, False

    try:
        result = tool_class().run(context, **arguments)
        return result, True
    except Exception as exc:
        logger.exception('Tool "%s" failed during execution', tool_name)
        return {'error': f'Tool "{tool_name}" failed: {type(exc).__name__}: {exc}'}, False


@dataclass(slots=True)
class AIOrchestrator:
    """Constrained assistant workflow for approved enterprise actions."""

    client: LMStudioClient
    prompt_manager: PromptManager = field(default_factory=PromptManager)
    registry: ToolRegistry = field(default_factory=lambda: tool_registry)
    max_iterations: int = MAX_TOOL_ITERATIONS

    def build_messages(
        self,
        user_message: str,
        history: list[ConversationMessage] | None = None,
    ) -> list[dict[str, Any]]:
        """Build the complete message list sent to LM Studio."""

        self.registry.discover()
        messages = self.prompt_manager.build_system_messages(self.registry.descriptions())
        if history:
            messages.extend(history)
        messages.append(ConversationMessage(role='user', content=user_message))
        return [message.to_openai_dict() for message in messages]

    def run(
        self,
        user_message: str,
        context: ToolContext,
        history: list[ConversationMessage] | None = None,
    ) -> OrchestrationResult:
        """Run an orchestration loop and execute approved tool calls.

        The loop runs for at most *max_iterations* rounds to prevent
        an adversarial or confused model from triggering infinite tool
        invocations.
        """

        messages = self.build_messages(user_message=user_message, history=history)
        all_tool_calls: list[ToolInvocation] = []

        for iteration in range(self.max_iterations):
            completion = self.client.create_chat_completion(messages, tools=self.registry.schemas())
            assistant_message = completion.choices[0].message

            if not assistant_message.tool_calls:
                # Model is done — return its final text.
                content = assistant_message.content or ''
                return OrchestrationResult(
                    content=content,
                    tool_calls=all_tool_calls,
                    metadata={'model': self.client.model, 'iterations': iteration + 1},
                )

            # Process each tool call requested by the model.
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name or ''
                arguments = _safe_parse_arguments(tool_call.function.arguments)

                result, success = _execute_tool_safely(
                    self.registry, tool_name, context, arguments,
                )

                if success:
                    logger.info('Executed AI tool %s (iteration %d)', tool_name, iteration + 1)
                else:
                    logger.warning('AI tool %s failed (iteration %d)', tool_name, iteration + 1)

                audit_ai_action(
                    'tool_executed',
                    {'tool': tool_name, 'arguments': arguments},
                    user=context.user,
                    tool_name=tool_name,
                    response_payload=result,
                    success=success,
                    error_text=result.get('error', '') if not success else '',
                )

                all_tool_calls.append(
                    ToolInvocation(
                        name=tool_name,
                        arguments=arguments,
                        call_id=tool_call.id,
                    )
                )
                messages.append(
                    ConversationMessage(
                        role='tool',
                        content=json.dumps(result),
                        tool_call_id=tool_call.id,
                    ).to_openai_dict()
                )

        # Exhausted iterations — force a final completion without tools.
        logger.warning('Reached max tool iterations (%d), forcing final response', self.max_iterations)
        completion = self.client.create_chat_completion(messages)
        content = completion.choices[0].message.content or ''
        return OrchestrationResult(
            content=content,
            tool_calls=all_tool_calls,
            metadata={'model': self.client.model, 'iterations': self.max_iterations, 'capped': True},
        )

    async def stream(
        self,
        user_message: str,
        context: ToolContext,
        history: list[ConversationMessage] | None = None,
    ) -> Any:
        """Stream assistant output while keeping tool execution on the server side.

        Tool calls are executed between streaming rounds, with the same
        safety guards as :meth:`run`.
        """

        messages = self.build_messages(user_message=user_message, history=history)
        audit_ai_action('assistant_stream_started', {'model': self.client.model}, user=context.user)

        for iteration in range(self.max_iterations):
            content_chunks: list[str] = []
            tool_calls: dict[int, dict[str, Any]] = {}

            async for chunk in self.client.astream_chat_completion(messages, tools=self.registry.schemas()):
                delta = chunk.choices[0].delta
                if delta.content:
                    content_chunks.append(delta.content)
                    yield {'type': 'token', 'token': delta.content}

                if delta.tool_calls:
                    for tool_call in delta.tool_calls:
                        entry = tool_calls.setdefault(
                            tool_call.index,
                            {'id': tool_call.id, 'name': '', 'arguments': []},
                        )
                        if tool_call.function.name:
                            entry['name'] = tool_call.function.name
                        if tool_call.function.arguments:
                            entry['arguments'].append(tool_call.function.arguments)

            if not tool_calls:
                # No tools requested — streaming is complete.
                yield {'type': 'final', 'content': ''.join(content_chunks)}
                return

            # Execute accumulated tool calls.
            messages.append(
                ConversationMessage(role='assistant', content=''.join(content_chunks)).to_openai_dict(),
            )

            for tc_data in tool_calls.values():
                tool_name = tc_data['name']
                arguments = _safe_parse_arguments(''.join(tc_data['arguments']))

                import asyncio
                result, success = await asyncio.to_thread(
                    _execute_tool_safely, self.registry, tool_name, context, arguments,
                )

                audit_ai_action(
                    'tool_executed',
                    {'tool': tool_name, 'arguments': arguments},
                    user=context.user,
                    tool_name=tool_name,
                    response_payload=result,
                    success=success,
                    error_text=result.get('error', '') if not success else '',
                )

                messages.append(
                    ConversationMessage(
                        role='tool',
                        content=json.dumps(result),
                        tool_call_id=tc_data['id'],
                    ).to_openai_dict()
                )
                yield {'type': 'tool_result', 'tool': tool_name, 'result': result, 'success': success}

        # Exhausted iterations — force a final answer.
        logger.warning('Stream: reached max tool iterations (%d)', self.max_iterations)
        completion = await self.client.acreate_chat_completion(messages)
        final_text = completion.choices[0].message.content or ''
        yield {'type': 'final', 'content': final_text}
