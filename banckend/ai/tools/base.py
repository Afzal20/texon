"""Base tool abstractions used by the AI orchestrator."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, ClassVar


@dataclass(frozen=True, slots=True)
class ToolContext:
    """Execution context provided to every AI tool."""

    user: Any
    organization: Any | None
    request: Any | None = None


class AITool(ABC):
    """Abstract base class for approved assistant actions."""

    name: ClassVar[str]
    description: ClassVar[str]
    parameters: ClassVar[dict[str, Any]]

    @abstractmethod
    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        """Execute the tool and return a structured result payload."""

    @classmethod
    def schema(cls) -> dict[str, Any]:
        """Return the OpenAI-compatible tool schema for the model."""

        return {
            'type': 'function',
            'function': {
                'name': cls.name,
                'description': cls.description,
                'parameters': cls.parameters,
            },
        }
