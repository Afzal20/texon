from __future__ import annotations

from reporting.models import Dashboard, Report

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class ReportingSkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "reporting"

    @property
    def description(self) -> str:
        return "Reports and dashboards — access generated reports and dashboard configurations."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "list_reports",
                "List available reports, optionally filtered by type.",
                {
                    "report_type": {
                        "type": "string",
                        "enum": ["mis", "production", "efficiency", "quality", "financial", "inventory", "hr", "custom", ""],
                        "description": "Filter by report type",
                    }
                },
                [],
            ),
            self._make_tool(
                "list_dashboards",
                "List available dashboards.",
                {},
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "list_reports": self._list_reports,
            "list_dashboards": self._list_dashboards,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _list_reports(self, report_type: str = "") -> SkillResult:
        qs = Report.objects.all().order_by("-generated_at")
        if report_type:
            qs = qs.filter(report_type=report_type)
        data = list(qs.values("title", "report_type", "generated_by", "generated_at", "status")[:20])
        return self._success(data, tool_name="list_reports")

    def _list_dashboards(self) -> SkillResult:
        qs = Dashboard.objects.filter(is_default=True).values("name", "dashboard_type")
        return self._success(list(qs), tool_name="list_dashboards")
