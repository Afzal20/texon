from __future__ import annotations

from ..domain.entities import SkillResult, ToolDef
from ..domain.interfaces import BaseSkill


class BaseToolSkill(BaseSkill):
    def _success(self, data: any, tool_name: str = "") -> SkillResult:
        if isinstance(data, dict):
            data["_tool_name"] = tool_name
        return SkillResult(success=True, data=data)

    def _error(self, message: str) -> SkillResult:
        return SkillResult(success=False, error=message)

    def _make_tool(
        self, name: str, description: str, properties: dict, required: list[str] | None = None
    ) -> ToolDef:
        return ToolDef(
            name=name,
            description=description,
            parameters={
                "type": "object",
                "properties": properties,
                "required": required or [],
            },
        )
