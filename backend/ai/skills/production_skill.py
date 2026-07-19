from __future__ import annotations

from django.db.models import Q, Sum
from production.models import (
    CuttingRecord,
    FloorRequisition,
    InspectionPacking,
    ProductionLine,
    ProductionOrder,
    SewingRecord,
)

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class ProductionSkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "production"

    @property
    def description(self) -> str:
        return "Production management — orders, lines, cutting, sewing, inspection, and floor operations."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "production_status",
                "Get production status for a specific order or search by order number/style.",
                {"order_number": {"type": "string", "description": "Production order number to look up"}},
                ["order_number"],
            ),
            self._make_tool(
                "list_production_orders",
                "List production orders filtered by status.",
                {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "released", "in_progress", "completed", "on_hold", "cancelled", ""],
                        "description": "Filter by status (leave empty for all)",
                    },
                    "limit": {"type": "integer", "description": "Max records"},
                },
                [],
            ),
            self._make_tool(
                "production_lines",
                "List all production lines and their current status.",
                {},
            ),
            self._make_tool(
                "cutting_records",
                "Get cutting records for a production order.",
                {"order_number": {"type": "string", "description": "Production order number"}},
                ["order_number"],
            ),
            self._make_tool(
                "sewing_records",
                "Get sewing records for a production order.",
                {"order_number": {"type": "string", "description": "Production order number"}},
                ["order_number"],
            ),
            self._make_tool(
                "inspection_records",
                "Get inspection and packing records for a production order.",
                {"order_number": {"type": "string", "description": "Production order number"}},
                ["order_number"],
            ),
            self._make_tool(
                "floor_requisitions",
                "Get floor requisitions for a production order.",
                {"order_number": {"type": "string", "description": "Production order number"}},
                ["order_number"],
            ),
            self._make_tool(
                "production_summary",
                "Get a summary of all production activity — total orders, in-progress, completed counts.",
                {},
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "production_status": self._production_status,
            "list_production_orders": self._list_production_orders,
            "production_lines": self._production_lines,
            "cutting_records": self._cutting_records,
            "sewing_records": self._sewing_records,
            "inspection_records": self._inspection_records,
            "floor_requisitions": self._floor_requisitions,
            "production_summary": self._production_summary,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _production_status(self, order_number: str) -> SkillResult:
        try:
            order = ProductionOrder.objects.select_related("style", "production_line").get(order_number=order_number)
        except ProductionOrder.DoesNotExist:
            return self._error(f"Production order not found: {order_number}")
        return self._success({
            "order_number": order.order_number,
            "style_number": order.style.style_number,
            "style_name": order.style.name,
            "line": order.production_line.name if order.production_line else None,
            "quantity": order.quantity,
            "start_date": str(order.start_date),
            "end_date": str(order.end_date) if order.end_date else None,
            "status": order.status,
            "notes": order.notes,
        }, tool_name="production_status")

    def _list_production_orders(self, status: str = "", limit: int = 20) -> SkillResult:
        qs = ProductionOrder.objects.select_related("style", "production_line").all()
        if status:
            qs = qs.filter(status=status)
        qs = qs.order_by("-created_at")[:limit]
        data = list(qs.values("order_number", "style__style_number", "production_line__name", "quantity", "start_date", "end_date", "status"))
        return self._success(data, tool_name="list_production_orders")

    def _production_lines(self) -> SkillResult:
        qs = ProductionLine.objects.filter(is_active=True).values("name", "code", "capacity", "location")
        return self._success(list(qs), tool_name="production_lines")

    def _cutting_records(self, order_number: str) -> SkillResult:
        try:
            order = ProductionOrder.objects.get(order_number=order_number)
        except ProductionOrder.DoesNotExist:
            return self._error(f"Production order not found: {order_number}")
        qs = CuttingRecord.objects.filter(production_order=order).order_by("-date")
        data = list(qs.values("date", "quantity_cut", "fabric_used", "waste_quantity")[:30])
        return self._success(data, tool_name="cutting_records")

    def _sewing_records(self, order_number: str) -> SkillResult:
        try:
            order = ProductionOrder.objects.get(order_number=order_number)
        except ProductionOrder.DoesNotExist:
            return self._error(f"Production order not found: {order_number}")
        qs = SewingRecord.objects.filter(production_order=order).order_by("-date")
        data = list(qs.values("date", "input_quantity", "output_quantity", "defect_quantity", "efficiency")[:30])
        return self._success(data, tool_name="sewing_records")

    def _inspection_records(self, order_number: str) -> SkillResult:
        try:
            order = ProductionOrder.objects.get(order_number=order_number)
        except ProductionOrder.DoesNotExist:
            return self._error(f"Production order not found: {order_number}")
        qs = InspectionPacking.objects.filter(production_order=order).order_by("-date")
        data = list(qs.values("date", "inspected_quantity", "passed_quantity", "failed_quantity", "packed_quantity")[:30])
        return self._success(data, tool_name="inspection_records")

    def _floor_requisitions(self, order_number: str) -> SkillResult:
        try:
            order = ProductionOrder.objects.get(order_number=order_number)
        except ProductionOrder.DoesNotExist:
            return self._error(f"Production order not found: {order_number}")
        qs = FloorRequisition.objects.filter(production_order=order).order_by("-request_date")
        data = list(qs.values("item_type", "quantity_requested", "quantity_approved", "request_date", "status")[:30])
        return self._success(data, tool_name="floor_requisitions")

    def _production_summary(self) -> SkillResult:
        total = ProductionOrder.objects.count()
        in_progress = ProductionOrder.objects.filter(status="in_progress").count()
        completed = ProductionOrder.objects.filter(status="completed").count()
        pending = ProductionOrder.objects.filter(status="pending").count()
        on_hold = ProductionOrder.objects.filter(status="on_hold").count()
        return self._success({
            "total_orders": total,
            "in_progress": in_progress,
            "completed": completed,
            "pending": pending,
            "on_hold": on_hold,
        }, tool_name="production_summary")
