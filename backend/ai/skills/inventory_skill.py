from __future__ import annotations

from django.db import models
from inventory.models import Accessory, Fabric, StockMovement, Trim, Warehouse

from ..domain.entities import SkillResult, ToolDef
from .base import BaseToolSkill


class InventorySkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "inventory"

    @property
    def description(self) -> str:
        return "Inventory and warehouse management — fabrics, accessories, trims, stock movements, and warehouse info."

    @property
    def tool_definitions(self) -> list[ToolDef]:
        return [
            self._make_tool(
                "get_fabric_stock",
                "Get current fabric stock by code or search term.",
                {"code": {"type": "string", "description": "Fabric code or search term"}},
                ["code"],
            ),
            self._make_tool(
                "get_accessory_stock",
                "Get current accessory stock by code or search term.",
                {"code": {"type": "string", "description": "Accessory code or search term"}},
                ["code"],
            ),
            self._make_tool(
                "get_trim_stock",
                "Get current trim stock by code or search term.",
                {"code": {"type": "string", "description": "Trim code or search term"}},
                ["code"],
            ),
            self._make_tool(
                "list_warehouses",
                "List all active warehouses.",
                {},
            ),
            self._make_tool(
                "get_stock_movements",
                "Get recent stock movements, optionally filtered by item type.",
                {
                    "item_type": {
                        "type": "string",
                        "enum": ["fabric", "accessory", "trim", ""],
                        "description": "Filter by item type (leave empty for all)",
                    },
                    "limit": {"type": "integer", "description": "Max records to return"},
                },
                [],
            ),
            self._make_tool(
                "get_low_stock_items",
                "Get all inventory items below their threshold quantity.",
                {},
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "get_fabric_stock": self._get_fabric_stock,
            "get_accessory_stock": self._get_accessory_stock,
            "get_trim_stock": self._get_trim_stock,
            "list_warehouses": self._list_warehouses,
            "get_stock_movements": self._get_stock_movements,
            "get_low_stock_items": self._get_low_stock_items,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _get_fabric_stock(self, code: str) -> SkillResult:
        qs = Fabric.objects.filter(code__icontains=code).values(
            "code", "name", "color", "quantity", "unit", "warehouse__name", "threshold_quantity"
        )[:20]
        return self._success(list(qs), tool_name="get_fabric_stock")

    def _get_accessory_stock(self, code: str) -> SkillResult:
        qs = Accessory.objects.filter(code__icontains=code).values(
            "code", "name", "quantity", "unit", "warehouse__name", "threshold_quantity"
        )[:20]
        return self._success(list(qs), tool_name="get_accessory_stock")

    def _get_trim_stock(self, code: str) -> SkillResult:
        qs = Trim.objects.filter(code__icontains=code).values(
            "code", "name", "quantity", "unit", "warehouse__name", "threshold_quantity"
        )[:20]
        return self._success(list(qs), tool_name="get_trim_stock")

    def _list_warehouses(self) -> SkillResult:
        qs = Warehouse.objects.filter(is_active=True).values("name", "code", "location")
        return self._success(list(qs), tool_name="list_warehouses")

    def _get_stock_movements(self, item_type: str = "", limit: int = 20) -> SkillResult:
        qs = StockMovement.objects.all().order_by("-created_at")
        if item_type:
            qs = qs.filter(item_type=item_type)
        qs = qs.values("item_type", "movement_type", "quantity", "from_warehouse__name", "to_warehouse__name", "created_at")[:limit]
        return self._success(list(qs), tool_name="get_stock_movements")

    def _get_low_stock_items(self) -> SkillResult:
        fabrics = Fabric.objects.filter(quantity__lt=models.F("threshold_quantity")).values("code", "name", "quantity", "threshold_quantity", "unit")
        accessories = Accessory.objects.filter(quantity__lt=models.F("threshold_quantity")).values("code", "name", "quantity", "threshold_quantity", "unit")
        trims = Trim.objects.filter(quantity__lt=models.F("threshold_quantity")).values("code", "name", "quantity", "threshold_quantity", "unit")
        return self._success({
            "fabrics": list(fabrics),
            "accessories": list(accessories),
            "trims": list(trims),
        }, tool_name="get_low_stock_items")
