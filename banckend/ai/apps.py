"""Django application configuration for the AI app."""

from django.apps import AppConfig


class AiConfig(AppConfig):
    """Application configuration for the optional AI module."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai'
    verbose_name = 'AI Assistant'

    def ready(self) -> None:
        """Discover tools when the app starts."""

        from ai.tools.registry import tool_registry

        tool_registry.discover()
