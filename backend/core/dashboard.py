import json
import zlib
from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone

from buyers.models import Buyer
from orders.models import Order

# Distinct colors per application card (stable - keyed by app_label hash)
APP_COLORS = [
    "#10b981",  # emerald
    "#0ea5e9",  # sky
    "#8b5cf6",  # violet
    "#f59e0b",  # amber
    "#f43f5e",  # rose
    "#6366f1",  # indigo
    "#14b8a6",  # teal
    "#f97316",  # orange
    "#84cc16",  # lime
    "#06b6d4",  # cyan
    "#d946ef",  # fuchsia
    "#3b82f6",  # blue
]

APP_ICONS = {
    "authentication": "shield_person",
    "core": "dashboard_customize",
    "buyers": "handshake",
    "merchandising": "business_center",
    "ie_planning": "timeline",
    "production": "precision_manufacturing",
    "inventory": "inventory_2",
    "procurement": "local_shipping",
    "quality": "verified",
    "subcontract": "handyman",
    "accounts": "account_balance",
    "commercial": "sell",
    "crm": "support_agent",
    "hr": "badge",
    "fixed_assets": "warehouse",
    "tna": "schedule",
    "multi_company": "corporate_fare",
    "costing": "calculate",
    "orders": "receipt_long",
    "compliance": "gavel",
    "reporting": "monitoring",
    "performance": "trending_up",
    "planning": "calendar_month",
    "scheduling": "event",
    "rbac": "admin_panel_settings",
}


def dashboard_callback(request, context):
    """Dashboard callback - injects stats and charts into the custom index template."""

    orders = Order.objects.all()
    statuses = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"]

    # Application grid - each app card gets a distinct color + icon
    app_grid = []
    for app in context.get("app_list", []):
        color = APP_COLORS[zlib.crc32(app["app_label"].encode()) % len(APP_COLORS)]
        app_grid.append(
            {
                "name": app["name"],
                "app_label": app["app_label"],
                "url": app.get("app_url"),
                "color": color,
                "icon": APP_ICONS.get(app["app_label"], "apps"),
                "models": app["models"],
            }
        )
    context["app_grid"] = app_grid

    context["dashboard_stats"] = {
        "buyers": Buyer.objects.count(),
        "active_buyers": Buyer.objects.filter(is_active=True).count(),
        "orders": orders.count(),
        "open_orders": orders.exclude(status__in=["delivered", "cancelled"]).count(),
        "revenue": orders.exclude(status="cancelled").aggregate(total=Sum("total_value"))["total"] or 0,
        "units": orders.aggregate(total=Sum("quantity"))["total"] or 0,
    }

    context["dashboard_status"] = {
        status: orders.filter(status=status).count() for status in statuses
    }

    # Progress bars expect percentage values
    total = sum(context["dashboard_status"].values()) or 1
    context["dashboard_status_pct"] = {
        status: round(count * 100 / total)
        for status, count in context["dashboard_status"].items()
    }

    # Orders per month over the last 6 months
    months = []
    series = []
    today = timezone.localdate()
    for index in range(5, -1, -1):
        month_start = today.replace(day=1) - timedelta(days=30 * index)
        month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
        months.append(month_start.strftime("%b"))
        series.append(
            orders.filter(order_date__gte=month_start, order_date__lt=month_end).count()
        )

    # Charts are rendered client-side, data must be serialized JSON
    context["dashboard_chart"] = json.dumps(
        {
            "labels": months,
            "datasets": [
                {
                    "label": "Orders",
                    "data": series,
                    "borderColor": "#10b981",
                    "backgroundColor": "rgba(16, 185, 129, 0.15)",
                }
            ],
        }
    )

    context["recent_orders"] = orders.select_related("buyer").order_by("-order_date")[:5]

    return context
