import enum
from datetime import timedelta
import random
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from django.db import transaction
from django.utils import timezone

from .command_fingerprints import canonical_command
from .models import OutboxCommand


class CommandConflictError(Exception):
    """Raised when an operation UUID is reused with differing parameters or context."""


class LeaseError(Exception):
    """Raised when an outbox transition fails lease ownership or lease expiry checks."""


class FailureCategory(str, enum.Enum):
    TRANSIENT = "TRANSIENT"
    PERMANENT = "PERMANENT"
    UNKNOWN_OUTCOME = "UNKNOWN_OUTCOME"


def calculate_backoff(
    attempt: int,
    base_seconds: float = 1.0,
    max_seconds: float = 300.0,
    jitter: bool = True,
) -> timedelta:
    """Calculate exponential backoff with capped delay and jitter.

    Uses 2 ** attempt (never bitwise 2 ^ attempt).
    """
    attempt_num = max(0, attempt)
    raw_delay = min(max_seconds, base_seconds * (2 ** attempt_num))
    if jitter:
        # Full jitter between 50% and 100% of raw delay to avoid herd effect
        delay = random.uniform(raw_delay * 0.5, raw_delay)
    else:
        delay = raw_delay
    return timedelta(seconds=delay)


def enqueue_command(
    *,
    tenant_id: str,
    company_id: int,
    actor_id: str,
    command_name: str,
    schema_version: int = 1,
    aggregate_id: str,
    expected_revision: Optional[int] = None,
    parameters: Dict[str, Any],
    operation_uuid: Optional[UUID] = None,
    max_attempts: int = 5,
    now: Optional[timezone.datetime] = None,
) -> OutboxCommand:
    """Atomically validate and enqueue a business command into the transactional outbox.

    If the operation_uuid already exists:
    - If the canonical fingerprint matches identically, returns the existing record (idempotency).
    - If the fingerprint or context differs, raises CommandConflictError.
    """
    if operation_uuid is None:
        operation_uuid = uuid4()
    elif isinstance(operation_uuid, str):
        operation_uuid = UUID(operation_uuid)

    current_time = now or timezone.now()

    canonical = canonical_command(
        tenant_id=tenant_id,
        company_id=company_id,
        actor_id=actor_id,
        command_name=command_name,
        schema_version=schema_version,
        aggregate_id=aggregate_id,
        expected_revision=expected_revision,
        parameters=parameters,
    )

    with transaction.atomic():
        existing = OutboxCommand.objects.filter(operation_uuid=operation_uuid).first()
        if existing:
            if existing.fingerprint != canonical.fingerprint:
                raise CommandConflictError(
                    f"Operation {operation_uuid} already exists with different canonical fingerprint."
                )
            return existing

        command = OutboxCommand.objects.create(
            operation_uuid=operation_uuid,
            fingerprint=canonical.fingerprint,
            tenant_id=tenant_id,
            company_id=company_id,
            actor_id=actor_id,
            command_name=command_name,
            schema_version=schema_version,
            aggregate_id=aggregate_id,
            expected_revision=expected_revision,
            payload_json=canonical.payload_json,
            status=OutboxCommand.Status.PENDING,
            attempt_count=0,
            max_attempts=max_attempts,
            next_attempt_at=current_time,
        )
        return command


def claim_outbox_batch(
    worker_id: UUID,
    batch_size: int = 10,
    lease_seconds: int = 60,
    now: Optional[timezone.datetime] = None,
) -> List[OutboxCommand]:
    """Atomically claim eligible pending or expired-lease outbox commands for a worker.

    Uses SELECT FOR UPDATE SKIP LOCKED to prevent concurrency contention across workers.
    Eligible commands are:
    1. Status in (PENDING, RETRY_WAIT) with next_attempt_at <= now
    2. Status CLAIMED with lease_expires_at <= now (crash reclamation)
    """
    current_time = now or timezone.now()
    lease_expires = current_time + timedelta(seconds=lease_seconds)

    with transaction.atomic():
        # Find candidates matching criteria
        eligible_ids = list(
            OutboxCommand.objects.filter(
                models_filter(current_time)
            )
            .select_for_update(skip_locked=True)
            .values_list("id", flat=True)[:batch_size]
        )

        if not eligible_ids:
            return []

        OutboxCommand.objects.filter(id__in=eligible_ids).update(
            status=OutboxCommand.Status.CLAIMED,
            lease_token=worker_id,
            lease_expires_at=lease_expires,
        )

        claimed = list(OutboxCommand.objects.filter(id__in=eligible_ids).order_by("id"))
        return claimed


def models_filter(current_time):
    from django.db.models import Q
    return (
        Q(status__in=[OutboxCommand.Status.PENDING, OutboxCommand.Status.RETRY_WAIT], next_attempt_at__lte=current_time)
        | Q(status=OutboxCommand.Status.CLAIMED, lease_expires_at__lte=current_time)
    )


def record_outbox_success(
    command_id: int,
    worker_id: UUID,
    response_data: Optional[Dict[str, Any]] = None,
) -> OutboxCommand:
    """Record successful execution of a claimed command."""
    with transaction.atomic():
        command = OutboxCommand.objects.select_for_update().get(id=command_id)
        if command.status != OutboxCommand.Status.CLAIMED or command.lease_token != worker_id:
            raise LeaseError(f"Command {command_id} is not claimed by worker {worker_id}")

        command.status = OutboxCommand.Status.SUCCEEDED
        command.lease_token = None
        command.lease_expires_at = None
        command.response_data = response_data or {}
        command.error_code = ""
        command.error_message = ""
        command.save(update_fields=[
            "status", "lease_token", "lease_expires_at",
            "response_data", "error_code", "error_message", "updated_at"
        ])
        return command


def record_outbox_failure(
    command_id: int,
    worker_id: UUID,
    category: FailureCategory,
    error_code: str = "",
    error_message: str = "",
    now: Optional[timezone.datetime] = None,
) -> OutboxCommand:
    """Record execution failure with retry classification and exponential backoff."""
    current_time = now or timezone.now()

    with transaction.atomic():
        command = OutboxCommand.objects.select_for_update().get(id=command_id)
        if command.status != OutboxCommand.Status.CLAIMED or command.lease_token != worker_id:
            raise LeaseError(f"Command {command_id} is not claimed by worker {worker_id}")

        command.attempt_count += 1
        command.error_code = error_code[:64]
        command.error_message = error_message
        command.lease_token = None
        command.lease_expires_at = None

        if category == FailureCategory.PERMANENT:
            command.status = OutboxCommand.Status.REJECTED
        elif category == FailureCategory.UNKNOWN_OUTCOME:
            command.status = OutboxCommand.Status.OUTCOME_UNKNOWN
        elif category == FailureCategory.TRANSIENT:
            if command.attempt_count >= command.max_attempts:
                command.status = OutboxCommand.Status.DEAD_LETTER
            else:
                command.status = OutboxCommand.Status.RETRY_WAIT
                backoff = calculate_backoff(command.attempt_count)
                command.next_attempt_at = current_time + backoff
        else:
            command.status = OutboxCommand.Status.DEAD_LETTER

        command.save(update_fields=[
            "status", "attempt_count", "lease_token", "lease_expires_at",
            "error_code", "error_message", "next_attempt_at", "updated_at"
        ])
        return command
