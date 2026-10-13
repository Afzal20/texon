import json
import logging
from typing import Optional
from uuid import UUID, uuid4

from .models import OutboxCommand
from .odoo_client import (
    OdooBusinessError,
    OdooClient,
    OdooTimeoutError,
    OdooTransientError,
)
from .outbox import (
    FailureCategory,
    claim_outbox_batch,
    record_outbox_failure,
    record_outbox_success,
)

logger = logging.getLogger(__name__)


def dispatch_single_command(
    command: OutboxCommand,
    worker_id: UUID,
    client: Optional[OdooClient] = None,
) -> OutboxCommand:
    """Execute a claimed outbox command against Odoo and atomically record its outcome."""
    if client is None:
        client = OdooClient()

    try:
        envelope = json.loads(command.payload_json)
        parameters = envelope.get("parameters", {})
    except (ValueError, TypeError) as e:
        logger.error("Corrupted payload for command %s: %s", command.id, e)
        return record_outbox_failure(
            command.id,
            worker_id=worker_id,
            category=FailureCategory.PERMANENT,
            error_code="CORRUPT_PAYLOAD",
            error_message=str(e),
        )

    try:
        result = client.execute_atomic_command(
            operation_uuid=command.operation_uuid,
            company_id=command.company_id,
            command_name=command.command_name,
            payload=parameters,
            actor_id=command.actor_id,
        )
        return record_outbox_success(command.id, worker_id=worker_id, response_data=result)

    except OdooTimeoutError as e:
        logger.warning(
            "Timeout during execution of command %s (%s). Flagging as OUTCOME_UNKNOWN for idempotent replay.",
            command.id, command.operation_uuid
        )
        return record_outbox_failure(
            command.id,
            worker_id=worker_id,
            category=FailureCategory.UNKNOWN_OUTCOME,
            error_code="TIMEOUT_AFTER_DISPATCH",
            error_message=str(e),
        )

    except OdooTransientError as e:
        logger.warning("Transient transport failure for command %s: %s", command.id, e)
        return record_outbox_failure(
            command.id,
            worker_id=worker_id,
            category=FailureCategory.TRANSIENT,
            error_code="TRANSIENT_NETWORK_FAILURE",
            error_message=str(e),
        )

    except OdooBusinessError as e:
        logger.info("Business rejection from Odoo for command %s: %s", command.id, e)
        return record_outbox_failure(
            command.id,
            worker_id=worker_id,
            category=FailureCategory.PERMANENT,
            error_code="BUSINESS_REJECTION",
            error_message=str(e),
        )

    except Exception as e:
        logger.exception("Unexpected exception dispatching command %s: %s", command.id, e)
        return record_outbox_failure(
            command.id,
            worker_id=worker_id,
            category=FailureCategory.TRANSIENT,
            error_code="UNEXPECTED_DISPATCH_ERROR",
            error_message=str(e),
        )


def process_outbox_batch(
    worker_id: Optional[UUID] = None,
    batch_size: int = 10,
    client: Optional[OdooClient] = None,
) -> int:
    """Claim and dispatch a batch of ready commands from the outbox queue."""
    wid = worker_id or uuid4()
    claimed = claim_outbox_batch(worker_id=wid, batch_size=batch_size)
    if not claimed:
        return 0

    if client is None:
        client = OdooClient()

    for command in claimed:
        dispatch_single_command(command, worker_id=wid, client=client)

    return len(claimed)
