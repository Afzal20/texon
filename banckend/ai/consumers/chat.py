"""WebSocket consumer for streamed AI assistant interactions."""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from channels.generic.websocket import AsyncWebsocketConsumer

from ai.prompts.manager import PromptManager
from ai.services.audit import audit_ai_action
from ai.services.history import ConversationHistoryService
from ai.services.lm_studio_client import LMStudioClient
from ai.services.orchestrator import AIOrchestrator
from ai.tools.base import ToolContext

logger = logging.getLogger(__name__)

# ── Safety constants ──────────────────────────────────────────────
MAX_WS_PAYLOAD_BYTES = 16_384  # 16 KB
MAX_MESSAGE_LENGTH = 4_000
MAX_MESSAGES_PER_MINUTE = 20


class AIChatConsumer(AsyncWebsocketConsumer):
    """Stream assistant tokens and tool outcomes to authenticated users."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.user: Any = None
        self._message_timestamps: list[float] = []

    # ── Connection lifecycle ──────────────────────────────────────

    async def connect(self) -> None:
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        await self.accept()
        await self._send_event('connection_established', message='AI channel ready.')

    async def disconnect(self, code: int) -> None:  # noqa: ARG002
        self._message_timestamps.clear()

    # ── Receive handler ───────────────────────────────────────────

    async def receive(self, text_data: str | None = None, bytes_data: bytes | None = None) -> None:
        if not text_data:
            return

        # ① Reject oversized payloads.
        if len(text_data.encode('utf-8')) > MAX_WS_PAYLOAD_BYTES:
            await self._send_error('Payload too large (max 16 KB).')
            return

        # ② Rate-limit.
        if self._is_rate_limited():
            await self._send_error(f'Rate limit exceeded. Max {MAX_MESSAGES_PER_MINUTE} messages per minute.')
            return

        # ③ Parse JSON safely.
        try:
            payload = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            await self._send_error('Invalid JSON payload.')
            return

        if not isinstance(payload, dict):
            await self._send_error('Payload must be a JSON object.')
            return

        # ④ Extract and validate inputs.
        message = str(payload.get('message', '')).strip()
        if not message:
            await self._send_error('Message cannot be empty.')
            return
        if len(message) > MAX_MESSAGE_LENGTH:
            await self._send_error(f'Message too long (max {MAX_MESSAGE_LENGTH} chars).')
            return

        history_payload = payload.get('history', [])
        if not isinstance(history_payload, list):
            await self._send_error('"history" must be a list.')
            return

        # ⑤ Execute the AI pipeline inside a global try/except.
        try:
            await self._handle_ai_request(
                message=message,
                history_payload=history_payload,
                title=str(payload.get('title', '')).strip(),
                conversation_id=payload.get('conversation_id'),
            )
        except Exception:
            logger.exception('Unhandled error in AI consumer for user=%s', getattr(self.user, 'id', '?'))
            await self._send_error('An unexpected error occurred. Please try again.')

    # ── Core AI pipeline ──────────────────────────────────────────

    async def _handle_ai_request(
        self,
        message: str,
        history_payload: list,
        title: str,
        conversation_id: int | None,
    ) -> None:
        """Orchestrate the full AI request/response cycle."""

        prompt_manager = PromptManager()
        try:
            history = prompt_manager.normalize_history(history_payload)
        except (KeyError, TypeError, ValueError):
            await self._send_error('The "history" field contains invalid messages.')
            return

        history_service = ConversationHistoryService()
        conversation = await asyncio.to_thread(
            history_service.get_or_create_conversation,
            self.user,
            title=title,
            conversation_id=conversation_id,
        )

        await asyncio.to_thread(
            history_service.append_message, conversation, 'user', message,
        )

        await asyncio.to_thread(
            audit_ai_action,
            'assistant_message_received',
            {'user_id': getattr(self.user, 'id', None), 'conversation_id': conversation.id, 'message': message},
            user=self.user,
            conversation=conversation,
        )

        orchestrator = AIOrchestrator(client=LMStudioClient())
        context = ToolContext(
            user=self.user,
            organization=getattr(self.user, 'organization', None),
            request=None,
        )

        async for event in orchestrator.stream(message, context=context, history=history):
            await self.send(text_data=json.dumps(event))

            if event.get('type') == 'tool_result':
                await asyncio.to_thread(
                    history_service.append_message,
                    conversation,
                    'tool',
                    content=json.dumps(event.get('result', {})),
                    tool_name=event.get('tool', ''),
                    metadata={'tool': event.get('tool', '')},
                )
                await asyncio.to_thread(
                    audit_ai_action,
                    'tool_executed',
                    {'conversation_id': conversation.id, 'tool': event.get('tool', '')},
                    user=self.user,
                    conversation=conversation,
                    tool_name=event.get('tool', ''),
                    response_payload=event.get('result', {}),
                    success=event.get('success', True),
                )

            elif event.get('type') == 'final':
                await asyncio.to_thread(
                    history_service.append_message,
                    conversation,
                    'assistant',
                    content=event.get('content', ''),
                )

    # ── Helpers ────────────────────────────────────────────────────

    def _is_rate_limited(self) -> bool:
        """Simple sliding-window rate limiter per WebSocket connection."""

        now = time.monotonic()
        cutoff = now - 60.0
        self._message_timestamps = [ts for ts in self._message_timestamps if ts > cutoff]
        if len(self._message_timestamps) >= MAX_MESSAGES_PER_MINUTE:
            return True
        self._message_timestamps.append(now)
        return False

    async def _send_event(self, event_type: str, **fields: Any) -> None:
        """Send a typed JSON event to the client."""

        await self.send(text_data=json.dumps({'type': event_type, **fields}))

    async def _send_error(self, message: str) -> None:
        """Send a structured error event to the client."""

        await self._send_event('error', message=message)
