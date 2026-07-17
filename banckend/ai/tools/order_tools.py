"""Order-related AI tools that call the existing Django models directly."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models import Q

from ai.tools.base import AITool, ToolContext
from ai.tools.registry import tool_registry
from orders.models import Buyer, PurchaseOrder, Season, Style

# ── Safety constants ──────────────────────────────────────────────
MAX_SEARCH_LIMIT = 50


def _validate_date(value: str) -> date:
    """Parse and validate a date string in ISO 8601 format.

    Raises :class:`ValueError` with a clear message on invalid input.
    """

    try:
        parsed = datetime.strptime(value, '%Y-%m-%d').date()
    except (ValueError, TypeError) as exc:
        raise ValueError(f'Invalid date format "{value}". Expected YYYY-MM-DD.') from exc

    if parsed < date(2000, 1, 1):
        raise ValueError(f'Date "{value}" is unreasonably far in the past.')
    return parsed


@tool_registry.register
class CreateBuyerTool(AITool):
    """Create a buyer record for the user's organization."""

    name = 'create_buyer'
    description = "Create a buyer record within the authenticated user's organization."
    parameters = {
        'type': 'object',
        'properties': {
            'name': {'type': 'string'},
            'code': {'type': 'string'},
            'country': {'type': 'string'},
        },
        'required': ['name', 'code', 'country'],
        'additionalProperties': False,
    }

    @transaction.atomic
    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        organization = context.organization
        if organization is None:
            raise ValueError('Organization is required to create a buyer.')

        buyer = Buyer.objects.create(
            organization=organization,
            name=kwargs['name'],
            code=kwargs['code'],
            country=kwargs['country'],
        )
        return {'id': buyer.id, 'code': buyer.code, 'name': buyer.name}


@tool_registry.register
class CreateStyleTool(AITool):
    """Create a style record using existing Buyer and Season models."""

    name = 'create_style'
    description = 'Create a style linked to a buyer and season in the organization.'
    parameters = {
        'type': 'object',
        'properties': {
            'buyer_id': {'type': 'integer'},
            'season_id': {'type': 'integer'},
            'code': {'type': 'string'},
            'description': {'type': 'string'},
        },
        'required': ['buyer_id', 'season_id', 'code'],
        'additionalProperties': False,
    }

    @transaction.atomic
    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        organization = context.organization
        if organization is None:
            raise ValueError('Organization is required to create a style.')

        try:
            buyer = Buyer.objects.get(pk=kwargs['buyer_id'], organization=organization)
        except ObjectDoesNotExist:
            raise ValueError(f'Buyer with id={kwargs["buyer_id"]} not found in your organization.')

        try:
            season = Season.objects.get(pk=kwargs['season_id'], organization=organization)
        except ObjectDoesNotExist:
            raise ValueError(f'Season with id={kwargs["season_id"]} not found in your organization.')

        style = Style.objects.create(
            organization=organization,
            buyer=buyer,
            season=season,
            code=kwargs['code'],
            description=kwargs.get('description', ''),
        )
        return {'id': style.id, 'code': style.code}


@tool_registry.register
class CreatePurchaseOrderTool(AITool):
    """Create a purchase order using the existing order models."""

    name = 'create_purchase_order'
    description = 'Create a purchase order for a style in the authenticated organization.'
    parameters = {
        'type': 'object',
        'properties': {
            'style_id': {'type': 'integer'},
            'po_number': {'type': 'string'},
            'qty': {'type': 'integer'},
            'ship_date': {'type': 'string', 'format': 'date'},
        },
        'required': ['style_id', 'po_number', 'qty', 'ship_date'],
        'additionalProperties': False,
    }

    @transaction.atomic
    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        organization = context.organization
        if organization is None:
            raise ValueError('Organization is required to create a purchase order.')

        validated_date = _validate_date(kwargs['ship_date'])

        try:
            style = Style.objects.get(pk=kwargs['style_id'], organization=organization)
        except ObjectDoesNotExist:
            raise ValueError(f'Style with id={kwargs["style_id"]} not found in your organization.')

        if kwargs.get('qty', 0) <= 0:
            raise ValueError('Quantity must be a positive integer.')

        purchase_order = PurchaseOrder.objects.create(
            organization=organization,
            style=style,
            po_number=kwargs['po_number'],
            qty=kwargs['qty'],
            ship_date=validated_date,
        )
        return {
            'id': purchase_order.id,
            'po_number': purchase_order.po_number,
            'current_stage': purchase_order.current_stage,
        }


@tool_registry.register
class UpdatePurchaseOrderTool(AITool):
    """Update a purchase order using the existing ORM model."""

    name = 'update_purchase_order'
    description = 'Update a purchase order quantity, ship date, or stage within the organization.'
    parameters = {
        'type': 'object',
        'properties': {
            'po_number': {'type': 'string'},
            'qty': {'type': 'integer'},
            'ship_date': {'type': 'string', 'format': 'date'},
            'current_stage': {'type': 'string'},
        },
        'required': ['po_number'],
        'additionalProperties': False,
    }

    @transaction.atomic
    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        organization = context.organization
        if organization is None:
            raise ValueError('Organization is required to update a purchase order.')

        try:
            purchase_order = PurchaseOrder.objects.select_for_update().get(
                po_number=kwargs['po_number'],
                organization=organization,
            )
        except ObjectDoesNotExist:
            raise ValueError(f'Purchase order "{kwargs["po_number"]}" not found in your organization.')

        if 'qty' in kwargs:
            if kwargs['qty'] <= 0:
                raise ValueError('Quantity must be a positive integer.')
            purchase_order.qty = kwargs['qty']
        if 'ship_date' in kwargs:
            purchase_order.ship_date = _validate_date(kwargs['ship_date'])
        if 'current_stage' in kwargs:
            purchase_order.current_stage = kwargs['current_stage']
        purchase_order.save()

        return {
            'id': purchase_order.id,
            'po_number': purchase_order.po_number,
            'qty': purchase_order.qty,
            'ship_date': str(purchase_order.ship_date),
            'current_stage': purchase_order.current_stage,
        }


@tool_registry.register
class SearchOrdersTool(AITool):
    """Search purchase orders without allowing direct query generation."""

    name = 'search_orders'
    description = 'Search purchase orders by PO number, style code, or stage within the organization.'
    parameters = {
        'type': 'object',
        'properties': {
            'query': {'type': 'string'},
            'limit': {'type': 'integer', 'default': 10},
        },
        'required': ['query'],
        'additionalProperties': False,
    }

    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        organization = context.organization
        if organization is None:
            raise ValueError('Organization is required to search orders.')

        query = kwargs['query'].strip()
        if not query:
            raise ValueError('Search query cannot be empty.')

        limit = min(max(int(kwargs.get('limit', 10)), 1), MAX_SEARCH_LIMIT)

        orders = (
            PurchaseOrder.objects
            .filter(organization=organization)
            .filter(
                Q(po_number__icontains=query)
                | Q(style__code__icontains=query)
                | Q(current_stage__icontains=query)
            )
            .select_related('style')
            .distinct()
            .order_by('po_number')
        )
        total_count = orders.count()
        orders = orders[:limit]

        return {
            'count': total_count,
            'showing': min(total_count, limit),
            'items': [
                {
                    'id': order.id,
                    'po_number': order.po_number,
                    'style_code': order.style.code,
                    'qty': order.qty,
                    'current_stage': order.current_stage,
                }
                for order in orders
            ],
        }
