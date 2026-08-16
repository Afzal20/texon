"""
Orders app GraphQL schema — implements the contract documented in
frontend_graphql_guide.md:

    allOrders, orderByPoNumber  ->  PurchaseOrderType

Type surface: PurchaseOrderType (id, poNumber, qty, shipDate, currentStage,
createdAt, style, items, stageLogs, riskScore, riskLevel), StyleType
(code, description, buyer, season, samples), BuyerType, SeasonType,
SampleOrderType, OrderItemType, OrderStageLogType.

The orders app's own Order model is exposed as sales orders
(allSalesOrders / salesOrderById).
"""

import graphene
from django.utils import timezone
from graphene_django import DjangoObjectType

from buyers.models import Buyer
from core.graphql import TYPE_REGISTRY
from merchandising.models import (
    OrderItem,
    OrderStageLog,
    PurchaseOrder,
    SampleOrder,
    Season,
    Style,
)
from orders.models import Order

PurchaseOrderCurrentStage = graphene.Enum(
    "OrdersPurchaseOrderCurrentStageChoices",
    [
        ("PO_RECEIVED", "PO_RECEIVED"),
        ("FABRIC_SOURCING", "FABRIC_SOURCING"),
        ("PRODUCTION", "PRODUCTION"),
        ("SHIPPING", "SHIPPING"),
    ],
)

_STAGE_MAP = {
    "pending": "PO_RECEIVED",
    "draft": "PO_RECEIVED",
    "confirmed": "FABRIC_SOURCING",
    "in_production": "PRODUCTION",
    "shipped": "SHIPPING",
    "delivered": "SHIPPING",
    "cancelled": "PO_RECEIVED",
}

_RISK_BASE = {
    "pending": 70,
    "draft": 70,
    "confirmed": 45,
    "in_production": 30,
    "shipped": 15,
    "delivered": 5,
    "cancelled": 100,
}


def _risk_metrics(order):
    days_left = (order.delivery_date - timezone.localdate()).days
    base = _RISK_BASE.get(order.status, 50)
    if days_left < 0:
        base += 40
    elif days_left < 15:
        base += 20
    score = min(100, max(0, base))
    level = "High" if score > 70 else ("Medium" if score >= 40 else "Low")
    return score, level


class BuyerType(DjangoObjectType):
    class Meta:
        model = Buyer
        fields = (
            "id", "name", "code", "country", "address", "contact_person",
            "email", "phone", "is_active", "sequence", "created_at", "updated_at",
        )


class SeasonType(DjangoObjectType):
    class Meta:
        model = Season
        fields = ("id", "name", "year", "created_at")


class SampleOrderType(DjangoObjectType):
    submission_date = graphene.Date()
    comments = graphene.String()

    class Meta:
        model = SampleOrder
        fields = (
            "id", "sample_type", "status", "quantity", "request_date",
            "deadline", "notes", "created_at", "updated_at",
        )

    def resolve_submission_date(self, info):
        return self.request_date

    def resolve_comments(self, info):
        return self.notes


class StyleType(DjangoObjectType):
    code = graphene.String()

    class Meta:
        model = Style
        fields = (
            "id", "name", "description", "category", "is_active",
            "created_at", "updated_at", "buyer", "season",
        )

    samples = graphene.List(lambda: SampleOrderType)

    def resolve_code(self, info):
        return self.style_number

    def resolve_samples(self, info):
        return self.sample_orders.all()


class OrderItemType(DjangoObjectType):
    class Meta:
        model = OrderItem
        fields = ("id", "color", "size", "qty")


class OrderStageLogType(DjangoObjectType):
    class Meta:
        model = OrderStageLog
        fields = ("id", "stage", "changed_at", "notes")


class PurchaseOrderType(DjangoObjectType):
    qty = graphene.Int()
    ship_date = graphene.Date()
    current_stage = graphene.Field(PurchaseOrderCurrentStage)
    risk_score = graphene.Float()
    risk_level = graphene.String()
    items = graphene.List(lambda: OrderItemType)
    stage_logs = graphene.List(lambda: OrderStageLogType)

    class Meta:
        model = PurchaseOrder
        fields = (
            "id", "po_number", "order_date", "delivery_date", "quantity",
            "unit_price", "total_value", "status", "notes",
            "created_at", "updated_at", "buyer", "style",
        )

    def resolve_qty(self, info):
        return self.quantity

    def resolve_ship_date(self, info):
        return self.delivery_date

    def resolve_current_stage(self, info):
        return _STAGE_MAP.get(self.status, "PO_RECEIVED")

    def resolve_risk_score(self, info):
        return _risk_metrics(self)[0]

    def resolve_risk_level(self, info):
        return _risk_metrics(self)[1]

    def resolve_items(self, info):
        return self.items.all()

    def resolve_stage_logs(self, info):
        return self.stage_logs.all()


class SalesOrderType(DjangoObjectType):
    class Meta:
        model = Order
        fields = (
            "id", "order_number", "order_date", "delivery_date", "quantity",
            "unit_price", "total_value", "status", "priority", "notes",
            "created_at", "updated_at", "buyer", "style",
        )


_REGISTERED_TYPES = {
    Buyer: BuyerType,
    Season: SeasonType,
    SampleOrder: SampleOrderType,
    Style: StyleType,
    OrderItem: OrderItemType,
    OrderStageLog: OrderStageLogType,
    PurchaseOrder: PurchaseOrderType,
    Order: SalesOrderType,
}
for _model, _type in _REGISTERED_TYPES.items():
    TYPE_REGISTRY[f"{_model._meta.app_label}.{_model.__name__}"] = _type


class OrdersQuery(graphene.ObjectType):
    all_orders = graphene.List(PurchaseOrderType)
    order_by_po_number = graphene.Field(
        PurchaseOrderType, po_number=graphene.String(required=True)
    )

    all_sales_orders = graphene.List(SalesOrderType)
    sales_order_by_id = graphene.Field(SalesOrderType, id=graphene.ID(required=True))

    def resolve_all_orders(root, info):
        return PurchaseOrder.objects.all()

    def resolve_order_by_po_number(root, info, po_number):
        return PurchaseOrder.objects.filter(po_number=po_number).first()

    def resolve_all_sales_orders(root, info):
        return Order.objects.all()

    def resolve_sales_order_by_id(root, info, id):
        return Order.objects.filter(pk=id).first()