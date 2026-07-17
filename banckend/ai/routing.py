"""WebSocket routing for the AI assistant."""

from django.urls import re_path

from ai.consumers.chat import AIChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/ai/$', AIChatConsumer.as_asgi()),
]
