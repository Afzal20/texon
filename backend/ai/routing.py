from __future__ import annotations

from django.urls import re_path

from ai.consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/ai/chat/$", ChatConsumer.as_asgi()),
]
