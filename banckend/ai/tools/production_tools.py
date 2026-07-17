"""Production-related AI tools that operate through the ORM."""

from __future__ import annotations

from typing import Any

from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction

from ai.tools.base import AITool, ToolContext
from ai.tools.registry import tool_registry
from production.models import ProductionRecord


@tool_registry.register
class UpdateProductionRecordTool(AITool):
    """Update an existing production record."""

    name = 'update_production_record'
    description = 'Update an existing production record in the organization.'
    parameters = {
        'type': 'object',
        'properties': {
            'production_record_id': {'type': 'integer'},
            'shift_id': {'type': 'integer'},
            'output_pcs': {'type': 'integer'},
            'timestamp': {'type': 'string', 'format': 'date-time'},
        },
        'required': ['production_record_id'],
        'additionalProperties': False,
    }

    @transaction.atomic
    def run(self, context: ToolContext, **kwargs: Any) -> dict[str, Any]:
        organization = context.organization
        if organization is None:
            raise ValueError('Organization is required to update a production record.')

        try:
            record = ProductionRecord.objects.select_for_update().select_related(
                'production_line__production_unit',
            ).get(
                pk=kwargs['production_record_id'],
                production_line__production_unit__organization=organization,
            )
        except ObjectDoesNotExist:
            raise ValueError(
                f'Production record with id={kwargs["production_record_id"]} '
                'not found in your organization.'
            )

        if 'shift_id' in kwargs:
            record.shift_id = kwargs['shift_id']
        if 'output_pcs' in kwargs:
            if kwargs['output_pcs'] < 0:
                raise ValueError('Output pieces cannot be negative.')
            record.output_pcs = kwargs['output_pcs']
        if 'timestamp' in kwargs:
            record.timestamp = kwargs['timestamp']
        record.save()

        return {
            'id': record.id,
            'output_pcs': record.output_pcs,
            'timestamp': str(record.timestamp),
        }
