"""ASGI entrypoint.

Exposes the ASGI callable as a module-level variable named ``application``.

Websocket routing (channels) is optional: it is enabled only when the
``ai.routing`` module is present. On deployments where that module does not
exist (e.g. serverless hosts like Vercel), the app falls back to a plain
HTTP-only ASGI application instead of crashing at import time.
"""

from __future__ import annotations

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.asgi import get_asgi_application  # noqa: E402

django_asgi = get_asgi_application()

application = django_asgi

try:
    from channels.auth import AuthMiddlewareStack  # noqa: E402
    from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402

    import ai.routing  # noqa: E402,F401  (optional dependency)
except ModuleNotFoundError:
    # ``ai`` (or channels) not installed/deployed — serve HTTP only.
    pass
else:
    application = ProtocolTypeRouter(
        {
            "http": django_asgi,
            "websocket": AuthMiddlewareStack(
                URLRouter(ai.routing.websocket_urlpatterns)
            ),
        }
    )