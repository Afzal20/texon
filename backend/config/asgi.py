"""HTTP ASGI entry point for Texon.

AI uses authenticated HTTP streaming. Do not import the removed legacy AI
WebSocket routes while booting the ERP application.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_asgi_application()
