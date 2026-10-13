"""Application entry-point regressions."""

from importlib import import_module

from django.core.handlers.asgi import ASGIHandler
from django.test import SimpleTestCase


class AsgiStartupTests(SimpleTestCase):
    def test_http_application_boots_without_legacy_ai_routes(self):
        module = import_module("config.asgi")
        self.assertIsInstance(module.application, ASGIHandler)
