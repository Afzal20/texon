"""Streaming chat consumer.

Protocol (JSON frames):
    client → server:
        {"type": "chat.send", "message": "...", "conversation_id": 12|null}

    server → client:
        {"type": "chat.ready"}
        {"type": "chat.start", "conversation_id": 12, "message_id": 99, "title": "..."}
        {"type": "chat.token", "token": "par"}          # many
        {"type": "chat.done",  "assistant_message_id": 100, "conversation_id": 12}
        {"type": "chat.error", "detail": "..."}

Auth: SimpleJWT access token passed as ``?token=<access>`` on the WS URL.
"""

import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .llm import MAX_HISTORY_MESSAGES, stream_completion, title_from_message
from .models import Conversation, Message

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = await self._authenticate()
        if self.user is None:
            await self.close(code=4401)  # unauthorized
            return
        await self.accept()
        await self.send_json({"type": "chat.ready"})

    async def receive_json(self, data, **kwargs):
        try:
            await self._handle(data)
        except Exception:
            logger.exception("chat handler failed")
            await self.send_json(
                {"type": "chat.error", "detail": "Something went wrong. Please try again."}
            )

    async def _handle(self, data):
        if data.get("type") != "chat.send":
            return

        text = (data.get("message") or "").strip()
        if not text:
            await self.send_json({"type": "chat.error", "detail": "Empty message."})
            return
        if len(text) > 8000:
            await self.send_json({"type": "chat.error", "detail": "Message too long."})
            return

        try:
            conversation = await self._get_or_create_conversation(
                data.get("conversation_id"), text
            )
        except Conversation.DoesNotExist:
            await self.send_json(
                {"type": "chat.error", "detail": "Conversation not found."}
            )
            return

        user_message = await _save_user_message(conversation, text)
        await self.send_json(
            {
                "type": "chat.start",
                "conversation_id": conversation.id,
                "message_id": user_message.id,
                "title": conversation.title,
            }
        )

        history = await _conversation_history(conversation)
        reply_parts = []
        try:
            async for chunk in stream_completion(history):
                reply_parts.append(chunk)
                await self.send_json({"type": "chat.token", "token": chunk})
        except Exception:
            logger.exception("AI stream failed")
            if not reply_parts:
                await self.send_json(
                    {
                        "type": "chat.error",
                        "detail": "The AI service is unavailable right now. Please try again.",
                    }
                )
                return
            await self.send_json(
                {"type": "chat.token", "token": "\n\n_(connection interrupted)_"}
            )

        content = "".join(reply_parts)
        assistant_message = await _save_assistant_message(conversation, content)
        await self.send_json(
            {
                "type": "chat.done",
                "assistant_message_id": assistant_message.id,
                "conversation_id": conversation.id,
            }
        )

    # ── helpers ─────────────────────────────────────────────────────────────

    @database_sync_to_async
    def _authenticate(self):
        query = self.scope.get("query_string", b"").decode()
        params = dict(p.split("=", 1) for p in query.split("&") if "=" in p)
        raw = params.get("token", "")
        try:
            user_id = AccessToken(raw).payload.get("user_id")
            from authentication.models import User

            return User.objects.filter(id=user_id, is_active=True).first()
        except (TokenError, TypeError):
            return None

    @database_sync_to_async
    def _get_or_create_conversation(self, conversation_id, first_text):
        if conversation_id:
            return Conversation.objects.get(id=conversation_id, user=self.user)
        return Conversation.objects.create(user=self.user)


@database_sync_to_async
def _save_user_message(conversation, content):
    is_first = not conversation.messages.exists()
    msg = Message.objects.create(conversation=conversation, role="user", content=content)
    updates = ["updated_at"]
    if is_first:
        conversation.title = title_from_message(content)
        updates.append("title")
    conversation.save(update_fields=updates)
    return msg


@database_sync_to_async
def _save_assistant_message(conversation, content):
    msg = Message.objects.create(
        conversation=conversation, role="assistant", content=content
    )
    conversation.save(update_fields=["updated_at"])
    return msg


@database_sync_to_async
def _conversation_history(conversation):
    rows = (
        conversation.messages.order_by("-id").values("role", "content")[
            :MAX_HISTORY_MESSAGES
        ]
    )
    return list(reversed(list(rows)))
