from __future__ import annotations

from django.db import models
from django.db.models import Q
from quality.models import DefectCategory, EndLineQC, FabricInspection, FinalInspection, InlineQC, RejectionReport

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class QualitySkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "quality"

    @property
    def description(self) -> str:
        return "Quality control — fabric inspections, inline/endline QC, final inspections, and defect tracking."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "get_defect_categories",
                "List all defect categories.",
                {},
            ),
            self._make_tool(
                "get_fabric_inspections",
                "Get fabric inspection records.",
                {"status": {"type": "string", "enum": ["pending", "passed", "failed", "conditional", ""], "description": "Filter by status"}},
                [],
            ),
            self._make_tool(
                "get_rejection_reports",
                "Get rejection reports, optionally filtered by production stage.",
                {
                    "stage": {
                        "type": "string",
                        "enum": ["cutting", "sewing", "washing", "finishing", "packing", ""],
                        "description": "Filter by production stage",
                    }
                },
                [],
            ),
            self._make_tool(
                "quality_summary",
                "Get a summary of quality metrics.",
                {},
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "get_defect_categories": self._get_defect_categories,
            "get_fabric_inspections": self._get_fabric_inspections,
            "get_rejection_reports": self._get_rejection_reports,
            "quality_summary": self._quality_summary,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _get_defect_categories(self) -> SkillResult:
        qs = DefectCategory.objects.filter(is_active=True).values("name", "code", "description")
        return self._success(list(qs), tool_name="get_defect_categories")

    def _get_fabric_inspections(self, status: str = "") -> SkillResult:
        qs = FabricInspection.objects.all().order_by("-inspection_date")
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("inspection_date", "inspected_quantity", "passed_quantity", "rejected_quantity", "status", "inspected_by")[:20])
        return self._success(data, tool_name="get_fabric_inspections")

    def _get_rejection_reports(self, stage: str = "") -> SkillResult:
        qs = RejectionReport.objects.select_related("defect_category").all().order_by("-report_date")
        if stage:
            qs = qs.filter(stage=stage)
        data = list(qs.values("report_date", "stage", "rejected_quantity", "defect_category__name", "defect_details", "corrective_action")[:20])
        return self._success(data, tool_name="get_rejection_reports")

    def _quality_summary(self) -> SkillResult:
        passed_fabric = FabricInspection.objects.filter(status="passed").count()
        failed_fabric = FabricInspection.objects.filter(status="failed").count()
        total_rejected = RejectionReport.objects.aggregate(total=models.Sum("rejected_quantity"))["total"] or 0
        total_passed_final = FinalInspection.objects.filter(status="pass").count()
        total_failed_final = FinalInspection.objects.filter(status="fail").count()
        return self._success({
            "fabric_inspections_passed": passed_fabric,
            "fabric_inspections_failed": failed_fabric,
            "total_rejected_quantity": total_rejected,
            "final_inspections_passed": total_passed_final,
            "final_inspections_failed": total_failed_final,
        }, tool_name="quality_summary")
