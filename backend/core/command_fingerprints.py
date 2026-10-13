"""Versioned command serialization, not authorization or a digital signature.

Trusted server code supplies identity after authorizing the request. The same
canonical bytes must be stored/delivered with the fingerprint; do not hash one
representation and execute a separately reconstructed or mutable payload.
"""

from dataclasses import dataclass
from datetime import date, datetime, timezone
from decimal import Decimal
import hashlib
import json
import re
from uuid import UUID

MAX_BYTES = 262_144
MAX_NODES = 10_000
MAX_DEPTH = 20


@dataclass(frozen=True, slots=True)
class CanonicalCommand:
    format_version: int
    payload_json: str
    fingerprint: str


def _identifier(value, name):
    if not isinstance(value, str) or not value or value != value.strip() or len(value) > 128:
        raise ValueError(f"{name} must be a nonempty identifier of at most 128 characters")
    return value


def _integer(value, name, minimum=0):
    if type(value) is not int or not minimum <= value < 2**63:
        raise ValueError(f"{name} must be a valid integer")
    return value


def _canonical_value(value, *, depth=0, budget=None):
    if budget is None:
        budget = [MAX_NODES]
    budget[0] -= 1
    if budget[0] < 0 or depth > MAX_DEPTH:
        raise ValueError("Command parameters exceed structural limits")
    if value is None or isinstance(value, bool):
        return value
    if isinstance(value, str):
        if len(value) > MAX_BYTES:
            raise ValueError("Command string exceeds size limit")
        return value
    if type(value) is int:
        if not -(2**63) <= value < 2**63:
            raise ValueError("Command integer exceeds supported precision")
        return value
    if isinstance(value, Decimal):
        if not value.is_finite() or len(value.as_tuple().digits) > 38:
            raise ValueError("Command decimal is not finite or exceeds precision")
        if abs(value.as_tuple().exponent) > 38:
            raise ValueError("Command decimal exponent exceeds supported precision")
        text = format(value, "f")
        if "." in text:
            text = text.rstrip("0").rstrip(".")
        return "0" if value == 0 else text
    if isinstance(value, datetime):
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Command timestamps must include a timezone")
        return value.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, list):
        return [_canonical_value(item, depth=depth + 1, budget=budget) for item in value]
    if isinstance(value, dict):
        if not all(isinstance(key, str) for key in value):
            raise ValueError("Command object keys must be strings")
        return {key: _canonical_value(item, depth=depth + 1, budget=budget) for key, item in value.items()}
    # In particular, binary floats must never represent financial/quantity
    # values; use validated Decimal values or canonical decimal strings.
    raise ValueError("Unsupported command parameter type")


def canonical_command(*, tenant_id, company_id, actor_id, command_name,
                      schema_version, aggregate_id, expected_revision, parameters):
    """Bind all execution-relevant context to immutable canonical JSON v1.

    The operation UUID is a separate idempotency key. Identical content with
    distinct operation UUIDs is not automatically the same business request.
    Dispatch must separately validate its command allowlist and business schema.
    """
    command_name = _identifier(command_name, "command_name")
    if not re.fullmatch(r"[a-z][a-z0-9_.]*", command_name):
        raise ValueError("Invalid command name")
    if not isinstance(parameters, dict):
        raise ValueError("Command parameters must be an object")
    envelope = {
        "fingerprint_format": 1,
        "tenant_id": _identifier(tenant_id, "tenant_id"),
        "company_id": _integer(company_id, "company_id", minimum=1),
        "actor_id": _identifier(actor_id, "actor_id"),
        "command_name": command_name,
        "schema_version": _integer(schema_version, "schema_version", minimum=1),
        "aggregate_id": _identifier(aggregate_id, "aggregate_id"),
        "expected_revision": None if expected_revision is None else _integer(expected_revision, "expected_revision"),
        "parameters": _canonical_value(parameters),
    }
    try:
        body = json.dumps(envelope, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
        encoded = body.encode("utf-8")
    except (ValueError, UnicodeError):
        raise ValueError("Command cannot be serialized as canonical UTF-8 JSON") from None
    if len(encoded) > MAX_BYTES:
        raise ValueError("Command exceeds encoded size limit")
    return CanonicalCommand(1, body, hashlib.sha256(encoded).hexdigest())
