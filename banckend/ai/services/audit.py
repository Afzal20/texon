"""Audit logging helpers for AI actions."""

from __future__ import annotations

import json
import logging
from typing import Any

from ai.models import AIAuditEvent

logger = logging.getLogger('ai.audit')

# ── Safety constants ──────────────────────────────────────────────
MAX_PAYLOAD_SIZE = 32_768  # 32 KB max per JSON payload stored in the DB


def _truncate_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Truncate a payload dict if its JSON representation exceeds *MAX_PAYLOAD_SIZE*."""

    try:
        serialized = json.dumps(payload, default=str)
    except (TypeError, ValueError):
        return {'_truncated': True, '_reason': 'unserializable'}

    if len(serialized) <= MAX_PAYLOAD_SIZE:
        return payload

    logger.warning('Truncating audit payload from %d bytes to summary', len(serialized))
    return {
        '_truncated': True,
        '_original_size': len(serialized),
        '_keys': list(payload.keys())[:20],
    }


def audit_ai_action(
    action: str,
    payload: dict[str, Any],
    *,
    user: Any | None = None,
    conversation: Any | None = None,
    tool_name: str = '',
    response_payload: dict[str, Any] | None = None,
    success: bool = True,
    error_text: str = '',
) -> AIAuditEvent | None:
    """Write an audit trail entry for an AI-requested action.

    Never raises — audit failures are logged but do not crash the caller.
    """

    try:
        safe_payload = _truncate_payload(payload)
        safe_response = _truncate_payload(response_payload) if response_payload else {}

        logger.info('ai_action=%s success=%s tool=%s', action, success, tool_name or '-')

        return AIAuditEvent.objects.create(
            conversation=conversation,
            user=user,
            action=action,
            tool_name=tool_name,
            request_payload=safe_payload,
            response_payload=safe_response,
            success=success,
            error_text=error_text[:2000] if error_text else '',
        )
    except Exception:
        logger.exception('Failed to write audit event action=%s', action)
        return None
