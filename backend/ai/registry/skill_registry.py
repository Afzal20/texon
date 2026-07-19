from __future__ import annotations

from ..domain.entities import SkillResult, ToolDef
from ..domain.interfaces import BaseSkill


class SkillRegistry:
    def __init__(self):
        self._skills: dict[str, BaseSkill] = {}

    def register(self, skill: BaseSkill) -> None:
        self._skills[skill.name] = skill

    def register_many(self, *skills: BaseSkill) -> None:
        for skill in skills:
            self.register(skill)

    def get_skill(self, name: str) -> BaseSkill | None:
        return self._skills.get(name)

    @property
    def all_tools(self) -> list[ToolDef]:
        tools = []
        for skill in self._skills.values():
            tools.extend(skill.tool_definitions)
        return tools

    @property
    def skill_names(self) -> list[str]:
        return list(self._skills.keys())

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        for skill in self._skills.values():
            for td in skill.tool_definitions:
                if td.name == tool_name:
                    return skill.execute(tool_name, params, user_id=user_id)
        return SkillResult(success=False, error=f"Tool not found: {tool_name}")
