"""Reusable client for LM Studio's OpenAI-compatible chat endpoint."""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import AsyncIterator, Iterator, Sequence
from dataclasses import dataclass
from types import SimpleNamespace
from typing import Any

import requests
from django.conf import settings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

ChatMessage = dict[str, Any]

# ── Safety constants ──────────────────────────────────────────────
MAX_RESPONSE_SIZE = 1_048_576  # 1 MB — reject abnormally large responses
DEFAULT_CONNECT_TIMEOUT = 5.0
DEFAULT_READ_TIMEOUT = 120.0
MAX_RETRIES = 2


@dataclass(frozen=True, slots=True)
class LMStudioClientConfig:
    """Configuration for LM Studio's ``/v1/chat/completions`` endpoint."""

    base_url: str
    model: str
    connect_timeout: float = DEFAULT_CONNECT_TIMEOUT
    read_timeout: float = DEFAULT_READ_TIMEOUT
    max_retries: int = MAX_RETRIES


class LMStudioClient:
    """Small wrapper around LM Studio's OpenAI-compatible chat API."""

    def __init__(self, config: LMStudioClientConfig | None = None) -> None:
        self._config = config or LMStudioClientConfig(
            base_url=settings.LM_STUDIO_URL,
            model=settings.LM_STUDIO_MODEL,
        )
        self._session = self._build_session()

    def _build_session(self) -> requests.Session:
        """Create a ``requests.Session`` with retry and timeout defaults."""

        session = requests.Session()
        retry_strategy = Retry(
            total=self._config.max_retries,
            backoff_factor=0.5,
            status_forcelist=[502, 503, 504],
            allowed_methods=['POST'],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        return session

    @property
    def model(self) -> str:
        """Return the configured LM Studio model name."""

        return self._config.model

    @property
    def _timeout(self) -> tuple[float, float]:
        """Return ``(connect_timeout, read_timeout)`` as a tuple."""

        return (self._config.connect_timeout, self._config.read_timeout)

    def _payload(self, messages: Sequence[ChatMessage], *, stream: bool, **kwargs: Any) -> dict[str, Any]:
        """Build the OpenAI-compatible chat-completions request body."""

        return {
            'model': self.model,
            'messages': list(messages),
            'stream': stream,
            **kwargs,
        }

    @staticmethod
    def _event_from_line(line: bytes) -> dict[str, Any] | None:
        """Decode one OpenAI-compatible Server-Sent Event line."""

        decoded_line = line.decode('utf-8')
        if decoded_line == 'data: [DONE]':
            return None
        if not decoded_line.startswith('data: '):
            return {}

        try:
            return json.loads(decoded_line.removeprefix('data: '))
        except json.JSONDecodeError:
            logger.warning('Received malformed SSE data from LM Studio')
            return {}

    @staticmethod
    def _tool_call_from_payload(tool_call: dict[str, Any]) -> Any:
        """Convert an OpenAI tool call to the orchestrator's attribute shape."""

        function = tool_call.get('function', {})
        return SimpleNamespace(
            id=tool_call.get('id'),
            index=tool_call.get('index', 0),
            function=SimpleNamespace(
                name=function.get('name'),
                arguments=function.get('arguments', ''),
            ),
        )

    @staticmethod
    def _validate_response_size(response: requests.Response) -> None:
        """Reject abnormally large responses to prevent memory exhaustion."""

        content_length = response.headers.get('Content-Length')
        if content_length and int(content_length) > MAX_RESPONSE_SIZE:
            raise ValueError(
                f'LM Studio response too large: {content_length} bytes '
                f'(max {MAX_RESPONSE_SIZE})'
            )

    def create_chat_completion(self, messages: Sequence[ChatMessage], **kwargs: Any) -> Any:
        """Create a non-streaming completion in the format used by the orchestrator."""

        logger.debug('LM Studio non-streaming request model=%s messages=%d', self.model, len(messages))

        try:
            response = self._session.post(
                self._config.base_url,
                json=self._payload(messages, stream=False, **kwargs),
                timeout=self._timeout,
            )
            response.raise_for_status()
        except requests.ConnectionError as exc:
            raise ConnectionError(
                f'Cannot connect to LM Studio at {self._config.base_url}. '
                'Is the server running?'
            ) from exc
        except requests.Timeout as exc:
            raise TimeoutError(
                f'LM Studio request timed out after {self._config.read_timeout}s.'
            ) from exc

        self._validate_response_size(response)

        data = response.json()
        choices = data.get('choices')
        if not choices:
            raise ValueError('LM Studio returned a response with no choices.')

        message = choices[0].get('message', {})
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=message.get('content'),
                        tool_calls=[
                            self._tool_call_from_payload(tool_call)
                            for tool_call in message.get('tool_calls', [])
                        ],
                    )
                )
            ]
        )

    def stream_chat_completion(self, messages: Sequence[ChatMessage], **kwargs: Any) -> Iterator[Any]:
        """Stream OpenAI-compatible events as chunks used by the orchestrator."""

        logger.debug('LM Studio streaming request model=%s messages=%d', self.model, len(messages))

        try:
            response = self._session.post(
                self._config.base_url,
                json=self._payload(messages, stream=True, **kwargs),
                stream=True,
                timeout=self._timeout,
            )
            response.raise_for_status()
        except requests.ConnectionError as exc:
            raise ConnectionError(
                f'Cannot connect to LM Studio at {self._config.base_url}. '
                'Is the server running?'
            ) from exc
        except requests.Timeout as exc:
            raise TimeoutError(
                f'LM Studio streaming request timed out after {self._config.read_timeout}s.'
            ) from exc

        for line in response.iter_lines():
            if not line:
                continue
            event = self._event_from_line(line)
            if event is None:
                break
            if not event.get('choices'):
                continue

            delta = event['choices'][0].get('delta', {})
            tool_calls = [
                self._tool_call_from_payload(tool_call)
                for tool_call in delta.get('tool_calls', [])
            ]
            if delta.get('content') or tool_calls:
                yield SimpleNamespace(
                    choices=[
                        SimpleNamespace(
                            delta=SimpleNamespace(
                                content=delta.get('content'),
                                tool_calls=tool_calls,
                            )
                        )
                    ]
                )

    async def acreate_chat_completion(self, messages: Sequence[ChatMessage], **kwargs: Any) -> Any:
        """Create a non-streaming completion without blocking the event loop."""

        return await asyncio.to_thread(self.create_chat_completion, messages, **kwargs)

    async def astream_chat_completion(self, messages: Sequence[ChatMessage], **kwargs: Any) -> AsyncIterator[Any]:
        """Stream native LM Studio events without blocking the event loop."""

        stream = self.stream_chat_completion(messages, **kwargs)
        while True:
            chunk = await asyncio.to_thread(_next_chunk, stream)
            if chunk is None:
                break
            yield chunk


def _next_chunk(stream: Iterator[Any]) -> Any | None:
    """Return a stream item, using ``None`` as its end-of-stream sentinel."""

    return next(stream, None)
