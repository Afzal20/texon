"""Request-based tests for the AI orchestrator.

This test demonstrates how to exercise the AI layer without calling the real
LM Studio server. It builds a Django request, attaches an authenticated user,
and passes that request into the orchestrator context.
"""

from __future__ import annotations

import json
from types import SimpleNamespace
from typing import Any
from unittest.mock import patch

import requests
from django.test import RequestFactory, TestCase

from ai.schemas.messages import ConversationMessage
from ai.services.orchestrator import AIOrchestrator
from ai.tools.base import AITool, ToolContext
from ai.tools.registry import ToolRegistry
from users.models import CustomUser, Organization


class AIRequestOrchestratorTests(TestCase):
    """Verify the AI orchestration flow from a Django request context."""

    def setUp(self) -> None:
        self.factory = RequestFactory()
        self.organization = Organization.objects.create(name='Texon', code='TEXON')
        self.user = CustomUser.objects.create_user(
            email='planner@example.com',
            password='test-password',
            organization=self.organization,
        )

    def test_orchestrator_executes_an_approved_tool_from_request_context(self) -> None:
        """A request-backed context should allow only approved Python tools."""

        request = self.factory.post(
            '/api/ai/chat/',
            data=json.dumps({'message': 'Create a buyer for Acme.', 'history': []}),
            content_type='application/json',
        )
        request.user = self.user

        captured_requests: list[Any] = []

        class FakeCreateBuyerTool(AITool):
            name = 'create_buyer'
            description = 'Create a buyer for the current organization.'
            parameters = {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string'},
                    'code': {'type': 'string'},
                    'country': {'type': 'string'},
                },
                'required': ['name', 'code', 'country'],
                'additionalProperties': False,
            }

            def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
                captured_requests.append(context.request)
                return {
                    'id': 101,
                    'name': kwargs['name'],
                    'code': kwargs['code'],
                    'country': kwargs['country'],
                }

        registry = ToolRegistry()
        registry.register(FakeCreateBuyerTool)

        tool_call = SimpleNamespace(
            id='call-1',
            function=SimpleNamespace(
                name='create_buyer',
                arguments=json.dumps({'name': 'Acme', 'code': 'ACM', 'country': 'Bangladesh'}),
            ),
        )

        fake_client = self._make_fake_client(tool_call)

        orchestrator = AIOrchestrator(client=fake_client, registry=registry)
        context = ToolContext(user=self.user, organization=self.organization, request=request)

        with patch.object(ToolRegistry, 'discover', return_value=None):
            result = orchestrator.run(
                user_message='Create a buyer for Acme.',
                context=context,
                history=[ConversationMessage(role='user', content='Previous note')],
            )

        self.assertEqual(result.content, 'Buyer created successfully.')
        self.assertEqual(len(result.tool_calls), 1)
        self.assertEqual(result.tool_calls[0].name, 'create_buyer')
        self.assertIs(captured_requests[0], request)

    def test_lm_studio_stream_request_parses_streamed_lines(self) -> None:
        """Send a direct streaming request to the LM Studio API."""

        url = 'http://localhost:1234/v1/chat/completions'
        payload = {
            'model': 'octans-qwen3-ui-code-4b',
            'messages': [
                {
                    'role': 'user',
                    'content': 'Explain GraphQL.',
                }
            ],
            'stream': True,
        }

        response = requests.post(url, json=payload, stream=True)
        response.raise_for_status()

        chunks: list[str] = []
        for line in response.iter_lines():
            if not line:
                continue

            decoded_line = line.decode('utf-8')
            if decoded_line == 'data: [DONE]':
                break
            if decoded_line.startswith('data: '):
                event = json.loads(decoded_line.removeprefix('data: '))
                content = event.get('choices', [{}])[0].get('delta', {}).get('content', '')
                if content:
                    chunks.append(content)
                    print(content, end='', flush=True)

        self.assertTrue(chunks, 'LM Studio returned no streamed content.')

    def _make_completion_side_effect(self, tool_call: Any):
        """Return a fake OpenAI chat completion callable with tool-call flow."""

        first_completion = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content=None, tool_calls=[tool_call]),
                )
            ]
        )
        second_completion = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content='Buyer created successfully.', tool_calls=[]),
                )
            ]
        )

        class CompletionCaller:
            def __init__(self) -> None:
                self.calls: list[tuple[list[dict[str, Any]], dict[str, Any]]] = []

            def __call__(self, messages: list[dict[str, Any]], **kwargs: Any) -> Any:
                self.calls.append((messages, kwargs))
                if len(self.calls) == 1:
                    return first_completion
                return second_completion

        return CompletionCaller()

    def _make_fake_client(self, tool_call: Any):
        """Build a minimal LM Studio client double for orchestrator tests."""

        completion_caller = self._make_completion_side_effect(tool_call)

        class FakeLMStudioClient:
            model = 'gemma-4b'

            def create_chat_completion(self, messages: list[dict[str, Any]], **kwargs: Any) -> Any:
                return completion_caller(messages, **kwargs)

        return FakeLMStudioClient()
