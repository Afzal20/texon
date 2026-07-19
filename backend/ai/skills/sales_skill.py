from __future__ import annotations

from django.db.models import Q, Sum
from buyers.models import Buyer
from merchandising.models import BuyerEnquiry, PurchaseOrder, SampleOrder, Style

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class SalesSkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "sales"

    @property
    def description(self) -> str:
        return "Sales and merchandising — buyers, styles, purchase orders, enquiries, and samples."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "search_buyers",
                "Search buyers by name, code, or country.",
                {"query": {"type": "string", "description": "Buyer name, code, or country"}},
                ["query"],
            ),
            self._make_tool(
                "buyer_portfolio",
                "Get portfolio summary for a buyer (active orders, units, value).",
                {"buyer_code": {"type": "string", "description": "Buyer code"}},
                ["buyer_code"],
            ),
            self._make_tool(
                "search_styles",
                "Search styles by style number or name.",
                {"query": {"type": "string", "description": "Style number or name"}},
                ["query"],
            ),
            self._make_tool(
                "list_purchase_orders",
                "List purchase orders filtered by status.",
                {
                    "status": {
                        "type": "string",
                        "enum": ["draft", "confirmed", "in_production", "shipped", "delivered", "cancelled", ""],
                        "description": "Filter by status",
                    },
                    "limit": {"type": "integer", "description": "Max records"},
                },
                [],
            ),
            self._make_tool(
                "get_enquiries",
                "Get buyer enquiries filtered by status.",
                {
                    "status": {
                        "type": "string",
                        "enum": ["received", "under_review", "quoted", "converted", "lost", ""],
                        "description": "Filter by status",
                    }
                },
                [],
            ),
            self._make_tool(
                "get_sample_orders",
                "Get sample orders filtered by status.",
                {
                    "status": {
                        "type": "string",
                        "enum": ["requested", "in_progress", "submitted", "approved", "rejected", ""],
                        "description": "Filter by status",
                    }
                },
                [],
            ),
            self._make_tool(
                "sales_summary",
                "Get a summary of sales activity — total POs, buyers, styles.",
                {},
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "search_buyers": self._search_buyers,
            "buyer_portfolio": self._buyer_portfolio,
            "search_styles": self._search_styles,
            "list_purchase_orders": self._list_purchase_orders,
            "get_enquiries": self._get_enquiries,
            "get_sample_orders": self._get_sample_orders,
            "sales_summary": self._sales_summary,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _search_buyers(self, query: str) -> SkillResult:
        qs = Buyer.objects.filter(Q(name__icontains=query) | Q(code__icontains=query) | Q(country__icontains=query))
        data = list(qs.values("name", "code", "country", "contact_person", "email", "is_active")[:20])
        return self._success(data, tool_name="search_buyers")

    def _buyer_portfolio(self, buyer_code: str) -> SkillResult:
        try:
            buyer = Buyer.objects.get(code=buyer_code)
        except Buyer.DoesNotExist:
            return self._error(f"Buyer not found: {buyer_code}")
        portfolio = getattr(buyer, "portfolio", None)
        rating = getattr(buyer, "rating", None)
        return self._success({
            "name": buyer.name,
            "code": buyer.code,
            "country": buyer.country,
            "portfolio": {
                "active_orders": portfolio.active_orders if portfolio else 0,
                "total_units": portfolio.total_units if portfolio else 0,
                "total_value": str(portfolio.total_value) if portfolio else "0",
            } if portfolio else None,
            "rating": float(rating.rating) if rating else None,
        }, tool_name="buyer_portfolio")

    def _search_styles(self, query: str) -> SkillResult:
        qs = Style.objects.select_related("buyer").filter(
            Q(style_number__icontains=query) | Q(name__icontains=query)
        )
        data = list(qs.values("style_number", "name", "category", "buyer__name", "is_active")[:20])
        return self._success(data, tool_name="search_styles")

    def _list_purchase_orders(self, status: str = "", limit: int = 20) -> SkillResult:
        qs = PurchaseOrder.objects.select_related("buyer", "style").all().order_by("-created_at")
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("po_number", "buyer__name", "style__style_number", "quantity", "total_value", "order_date", "delivery_date", "status")[:limit])
        return self._success(data, tool_name="list_purchase_orders")

    def _get_enquiries(self, status: str = "") -> SkillResult:
        qs = BuyerEnquiry.objects.select_related("buyer", "style").all().order_by("-created_at")
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("buyer__name", "style__style_number", "enquiry_date", "status")[:20])
        return self._success(data, tool_name="get_enquiries")

    def _get_sample_orders(self, status: str = "") -> SkillResult:
        qs = SampleOrder.objects.select_related("buyer", "style").all().order_by("-created_at")
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("sample_type", "style__style_number", "buyer__name", "request_date", "deadline", "status")[:20])
        return self._success(data, tool_name="get_sample_orders")

    def _sales_summary(self) -> SkillResult:
        return self._success({
            "total_buyers": Buyer.objects.filter(is_active=True).count(),
            "total_styles": Style.objects.filter(is_active=True).count(),
            "total_purchase_orders": PurchaseOrder.objects.count(),
            "total_enquiries": BuyerEnquiry.objects.count(),
            "pending_samples": SampleOrder.objects.filter(status__in=["requested", "in_progress"]).count(),
        }, tool_name="sales_summary")
