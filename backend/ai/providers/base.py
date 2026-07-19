from __future__ import annotations

from ..domain.interfaces import BaseLLMProvider


class LLMProviderFactory:
    _instances: dict[str, BaseLLMProvider] = {}

    @classmethod
    def get_provider(cls, config: dict) -> BaseLLMProvider:
        path = config.get("provider", "ai.providers.lm_studio_provider.LMStudioProvider")
        if path not in cls._instances:
            parts = path.split(".")
            module_path = ".".join(parts[:-1])
            class_name = parts[-1]
            import importlib
            module = importlib.import_module(module_path)
            provider_class = getattr(module, class_name)
            cls._instances[path] = provider_class(config)
        return cls._instances[path]
