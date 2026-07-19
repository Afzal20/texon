from __future__ import annotations

from django.db.models import Q
from procurement.models import QuotationAnalysis, RawMaterialBooking, RawMaterialRequisition, Supplier

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class PurchaseSkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "purchase"

    @property
    def description(self) -> str:
        return "Procurement and supply chain — suppliers, requisitions, bookings, and quotations."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "search_suppliers",
                "Search suppliers by name, code, or type.",
                {
                    "query": {"type": "string", "description": "Search term"},
                    "supplier_type": {"type": "string", "enum": ["fabric", "accessory", "trim", "general", ""], "description": "Filter by supplier type"},
                },
                [],
            ),
            self._make_tool(
                "get_requisitions",
                "Get raw material requisitions, optionally filtered by status.",
                {
                    "status": {
                        "type": "string",
                        "enum": ["draft", "pending_approval", "approved", "ordered", "received", "cancelled", ""],
                        "description": "Filter by status (leave empty for all)",
                    },
                    "limit": {"type": "integer", "description": "Max records"},
                },
                [],
            ),
            self._make_tool(
                "get_bookings",
                "Get raw material bookings, optionally filtered by status.",
                {
                    "status": {
                        "type": "string",
                        "enum": ["draft", "confirmed", "partial_received", "received", "cancelled", ""],
                        "description": "Filter by status (leave empty for all)",
                    },
                    "limit": {"type": "integer", "description": "Max records"},
                },
                [],
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "search_suppliers": self._search_suppliers,
            "get_requisitions": self._get_requisitions,
            "get_bookings": self._get_bookings,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _search_suppliers(self, query: str = "", supplier_type: str = "") -> SkillResult:
        qs = Supplier.objects.filter(is_active=True)
        if query:
            qs = qs.filter(Q(name__icontains=query) | Q(code__icontains=query) | Q(contact_person__icontains=query))
        if supplier_type:
            qs = qs.filter(supplier_type=supplier_type)
        data = list(qs.values("name", "code", "supplier_type", "contact_person", "email", "phone", "rating")[:20])
        return self._success(data, tool_name="search_suppliers")

    def _get_requisitions(self, status: str = "", limit: int = 20) -> SkillResult:
        qs = RawMaterialRequisition.objects.all().order_by("-created_at")
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("requisition_number", "item_type", "quantity", "required_date", "status", "requested_by")[:limit])
        return self._success(data, tool_name="get_requisitions")

    def _get_bookings(self, status: str = "", limit: int = 20) -> SkillResult:
        qs = RawMaterialBooking.objects.select_related("supplier").all().order_by("-created_at")
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("booking_number", "supplier__name", "item_type", "quantity", "unit_price", "total_value", "status")[:limit])
        return self._success(data, tool_name="get_bookings")
