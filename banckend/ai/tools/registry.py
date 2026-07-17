"""Automatic discovery and lookup for AI tools."""

from __future__ import annotations

import inspect
import pkgutil
from collections.abc import Iterable
from dataclasses import dataclass, field
from importlib import import_module
from typing import Any

from ai.tools.base import AITool


class ToolNotFoundError(LookupError):
    """Raised when the orchestrator requests a tool that is not registered."""


@dataclass(slots=True)
class ToolRegistry:
    """Registry of approved assistant tools."""

    _tools: dict[str, type[AITool]] = field(default_factory=dict)

    def register(self, tool_class: type[AITool]) -> type[AITool]:
        """Register a tool class by its declared name."""

        self._tools[tool_class.name] = tool_class
        return tool_class

    def discover(self, package_name: str = 'ai.tools') -> None:
        """Import tool modules and collect concrete tool subclasses."""

        package = import_module(package_name)
        for module_info in pkgutil.iter_modules(package.__path__, package.__name__ + '.'):
            import_module(module_info.name)

        for subclass in AITool.__subclasses__():
            if inspect.isabstract(subclass):
                continue
            self._tools[subclass.name] = subclass

    def has(self, name: str) -> bool:
        """Check whether a tool with the given name is registered."""

        return name in self._tools

    def get(self, name: str) -> type[AITool]:
        """Retrieve a registered tool by name.

        Raises :class:`ToolNotFoundError` if the name is unknown.
        """

        try:
            return self._tools[name]
        except KeyError:
            available = ', '.join(sorted(self._tools.keys())) or '(none)'
            raise ToolNotFoundError(
                f'Tool "{name}" is not registered. Available tools: {available}'
            ) from None

    def all(self) -> list[type[AITool]]:
        """Return all registered tool classes."""

        return list(self._tools.values())

    def schemas(self) -> list[dict[str, Any]]:
        """Return all registered tool schemas for model registration."""

        return [tool_class.schema() for tool_class in self.all()]

    def descriptions(self) -> list[str]:
        """Return plain-text descriptions for prompt construction."""

        return [f'{tool_class.name}: {tool_class.description}' for tool_class in self.all()]


tool_registry = ToolRegistry()
