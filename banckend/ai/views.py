"""HTTP endpoints for the AI assistant."""

from __future__ import annotations

import logging
from typing import Any

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema

from ai.prompts.manager import PromptManager
from ai.serializers import AIChatRequestSerializer, AIChatResponseSerializer
from ai.services.audit import audit_ai_action
from ai.services.history import ConversationHistoryService
from ai.services.lm_studio_client import LMStudioClient
from ai.services.orchestrator import AIOrchestrator
from ai.tools.base import ToolContext

logger = logging.getLogger(__name__)


class AIChatView(APIView):
    """Send one chat message to the AI assistant and return its final reply."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai_chat'

    @extend_schema(
        request=AIChatRequestSerializer,
        responses={
            200: AIChatResponseSerializer,
            400: OpenApiResponse(description='Invalid request payload.'),
            401: OpenApiResponse(description='Authentication credentials were not provided.'),
            429: OpenApiResponse(description='Request was throttled.'),
            503: OpenApiResponse(description='The AI service is unavailable.'),
        },
        description='Requires JWT authentication. Send the access token as `Authorization: Bearer <token>`.',
        examples=[
            OpenApiExample(
                'Simple chat request',
                value={'message': 'Hello', 'history': [], 'title': 'General assistance'},
                request_only=True,
            ),
            OpenApiExample(
                'Chat with history',
                value={
                    'message': 'What is the status now?',
                    'history': [
                        {'role': 'user', 'content': 'Summarize today\'s orders.'},
                        {'role': 'assistant', 'content': 'There are 12 orders awaiting review.'},
                    ],
                },
                request_only=True,
            ),
            OpenApiExample(
                'Continue existing conversation',
                value={
                    'message': 'Show me the details',
                    'conversation_id': 42,
                    'history': [],
                },
                request_only=True,
            ),
        ],
    )
    def post(self, request: Any) -> Response:
        serializer = AIChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message: str = serializer.validated_data['message'].strip()
        history_payload: list = serializer.validated_data['history']
        conversation_id: int | None = serializer.validated_data.get('conversation_id')

        # The serializer already enforces min_length=1 but guard the stripped value too.
        if not message:
            return Response(
                {'message': ['This field may not be blank.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            history = PromptManager().normalize_history(history_payload)
        except (KeyError, TypeError, ValueError):
            return Response(
                {'detail': 'The "history" field contains an invalid message.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Conversation persistence ──────────────────────────────
        history_service = ConversationHistoryService()
        try:
            conversation = history_service.get_or_create_conversation(
                request.user,
                title=serializer.validated_data.get('title', '').strip(),
                conversation_id=conversation_id,
            )
        except PermissionError:
            return Response(
                {'detail': 'You do not have access to this conversation.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        context = ToolContext(
            user=request.user,
            organization=getattr(request.user, 'organization', None),
            request=request,
        )

        history_service.append_message(conversation, 'user', content=message)
        audit_ai_action(
            'assistant_message_received',
            {'user_id': request.user.id, 'conversation_id': conversation.id, 'message': message},
            user=request.user,
            conversation=conversation,
        )

        # ── AI orchestration ──────────────────────────────────────
        try:
            result = AIOrchestrator(client=LMStudioClient()).run(
                message, context=context, history=history,
            )
        except Exception as exc:
            logger.exception('AI chat request failed for user_id=%s', request.user.id)
            audit_ai_action(
                'assistant_message_failed',
                {'conversation_id': conversation.id, 'message': message},
                user=request.user,
                conversation=conversation,
                success=False,
                error_text=str(exc),
            )
            return Response(
                {'detail': 'The AI assistant is currently unavailable.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        history_service.append_message(conversation, 'assistant', content=result.content)

        return Response(
            {
                'conversation_id': conversation.id,
                'content': result.content,
                'tool_calls': [
                    {'name': call.name, 'arguments': call.arguments, 'call_id': call.call_id}
                    for call in result.tool_calls
                ],
                'metadata': result.metadata,
            },
            status=status.HTTP_200_OK,
        )
