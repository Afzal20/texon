from __future__ import annotations

from datetime import datetime
from typing import Any

from ..domain.entities import ChatMessage, MessageRole
from ..domain.interfaces import BaseSkill
from ..registry.skill_registry import SkillRegistry
from core.permissions import get_department_tier


SKILL_DESCRIPTIONS = {
    "employee": "Query employee profiles, attendance, leave, salary, overtime, and bonus information. Supports searching by employee ID, name, or department.",
    "production": "Track production orders, line status, cutting/sewing records, inspection results, and floor requisitions. Provides production summaries.",
    "inventory": "Check stock levels for fabrics, accessories, trims across warehouses. Identify low-stock items and view stock movement history.",
    "purchase": "Manage supplier information, raw material requisitions and bookings. Search suppliers and track procurement status.",
    "sales": "Access buyer profiles and portfolios, search styles, list purchase orders, enquiries, and sample orders. Get sales summaries.",
    "accounting": "View financial data — accounts payable/receivable, expenses, cost centers, chart of accounts, and financial summaries.",
    "quality": "Track quality control — fabric inspections, defect categories, rejection reports by stage, and quality summaries.",
    "reporting": "List available reports and dashboards by type.",
}

SYSTEM_PROMPT_TEMPLATE = """You are Texon AI — the intelligent assistant for the Texon RMG (Ready-Made Garments) ERP system.

## Your Role
You help factory managers, executives, and staff access and understand their ERP data through natural conversation. You can look up information across all factory operations.

## Available Skills
{skill_descriptions}

## Guidelines
- Answer based on real data from tool calls. If you cannot find information, say so clearly.
- When showing data, format it in a readable way — use tables for multiple records, concise summaries for single items.
- If a user asks for something outside your available tools, explain what you can help with instead.
- Keep responses concise and focused on the factory/ERP context.
- Today's date is {current_date}.

## User Context
- User Department Tier: {department_tier}
- User is Staff: {is_staff}
"""


class PromptBuilder:
    def __init__(self, registry: SkillRegistry):
        self._registry = registry

    def build_system_prompt(self, user: Any) -> str:
        tier = get_department_tier(user)
        skill_lines = []
        for skill_name in self._registry.skill_names:
            desc = SKILL_DESCRIPTIONS.get(skill_name, "")
            skill_lines.append(f"- **{skill_name.title()}**: {desc}")

        return SYSTEM_PROMPT_TEMPLATE.format(
            skill_descriptions="\n".join(skill_lines),
            current_date=datetime.utcnow().strftime("%Y-%m-%d"),
            department_tier=tier or "Unknown",
            is_staff="Yes" if user.is_staff else "No",
        )

    def build_system_message(self, user: Any) -> ChatMessage:
        return ChatMessage(
            role=MessageRole.SYSTEM,
            content=self.build_system_prompt(user),
        )
