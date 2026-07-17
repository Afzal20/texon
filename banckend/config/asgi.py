"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from importlib import import_module

from django.core.asgi import get_asgi_application
from django.urls import path, include
from django.conf import settings
from channels.routing import ProtocolTypeRouter, URLRouter
from users.middleware import JWTAuthMiddlewareStack

import notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns
            + (import_module('ai.routing').websocket_urlpatterns if settings.FEATURES.get('AI', False) else [])
        )
    ),
})
