from datetime import timedelta
from decimal import Decimal
from uuid import uuid4

from django.test import TestCase
from django.utils import timezone

from .models import OutboxCommand
from .outbox import (
    CommandConflictError,
    FailureCategory,
    LeaseError,
    calculate_backoff,
    claim_outbox_batch,
    enqueue_command,
    record_outbox_failure,
    record_outbox_success,
)


class OutboxServiceTests(TestCase):
    def setUp(self):
        self.tenant_id = "tenant-test"
        self.company_id = 1
        self.actor_id = "user-123"
        self.command_name = "sales.create"
        self.aggregate_id = "SO-2026-001"
        self.parameters = {
            "partner_id": 42,
            "client_order_ref": "PO-999",
            "lines": [
                {"product_id": 101, "quantity": Decimal("100"), "unit_price": Decimal("15.50")}
            ],
        }

    def test_enqueue_command_creates_pending_record(self):
        op_id = uuid4()
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
            operation_uuid=op_id,
        )

        self.assertEqual(cmd.operation_uuid, op_id)
        self.assertEqual(cmd.status, OutboxCommand.Status.PENDING)
        self.assertEqual(cmd.attempt_count, 0)
        self.assertTrue(cmd.fingerprint)
        self.assertIn('"fingerprint_format":1', cmd.payload_json)

    def test_enqueue_command_is_idempotent_for_matching_parameters(self):
        op_id = uuid4()
        cmd1 = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
            operation_uuid=op_id,
        )
        cmd2 = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
            operation_uuid=op_id,
        )

        self.assertEqual(cmd1.id, cmd2.id)
        self.assertEqual(OutboxCommand.objects.filter(operation_uuid=op_id).count(), 1)

    def test_enqueue_command_raises_conflict_for_altered_parameters(self):
        op_id = uuid4()
        enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
            operation_uuid=op_id,
        )

        altered_params = dict(self.parameters, partner_id=99)
        with self.assertRaises(CommandConflictError):
            enqueue_command(
                tenant_id=self.tenant_id,
                company_id=self.company_id,
                actor_id=self.actor_id,
                command_name=self.command_name,
                aggregate_id=self.aggregate_id,
                parameters=altered_params,
                operation_uuid=op_id,
            )

    def test_claim_batch_lifecycle_and_lease(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )

        worker_id = uuid4()
        claimed = claim_outbox_batch(worker_id=worker_id, batch_size=5, lease_seconds=120)

        self.assertEqual(len(claimed), 1)
        self.assertEqual(claimed[0].id, cmd.id)
        self.assertEqual(claimed[0].status, OutboxCommand.Status.CLAIMED)
        self.assertEqual(claimed[0].lease_token, worker_id)
        self.assertIsNotNone(claimed[0].lease_expires_at)

        # Another worker cannot claim already leased command
        other_worker = uuid4()
        second_claim = claim_outbox_batch(worker_id=other_worker, batch_size=5)
        self.assertEqual(len(second_claim), 0)

    def test_claim_recovers_expired_leases(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )

        dead_worker = uuid4()
        past_time = timezone.now() - timedelta(minutes=5)
        cmd.status = OutboxCommand.Status.CLAIMED
        cmd.lease_token = dead_worker
        cmd.lease_expires_at = past_time
        cmd.save()

        active_worker = uuid4()
        claimed = claim_outbox_batch(worker_id=active_worker, batch_size=5)

        self.assertEqual(len(claimed), 1)
        self.assertEqual(claimed[0].id, cmd.id)
        self.assertEqual(claimed[0].lease_token, active_worker)

    def test_record_outbox_success(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        worker_id = uuid4()
        claim_outbox_batch(worker_id=worker_id)

        response_payload = {"id": 1001, "name": "SO001", "state": "draft"}
        updated = record_outbox_success(cmd.id, worker_id=worker_id, response_data=response_payload)

        self.assertEqual(updated.status, OutboxCommand.Status.SUCCEEDED)
        self.assertEqual(updated.response_data, response_payload)
        self.assertIsNone(updated.lease_token)
        self.assertIsNone(updated.lease_expires_at)

    def test_record_outbox_transient_failure_and_dead_letter(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
            max_attempts=2,
        )
        worker_id = uuid4()
        claim_outbox_batch(worker_id=worker_id)

        # Attempt 1 -> RETRY_WAIT
        updated = record_outbox_failure(
            cmd.id,
            worker_id=worker_id,
            category=FailureCategory.TRANSIENT,
            error_code="CONNECTION_REFUSED",
            error_message="Odoo service unavailable",
        )
        self.assertEqual(updated.status, OutboxCommand.Status.RETRY_WAIT)
        self.assertEqual(updated.attempt_count, 1)
        self.assertGreater(updated.next_attempt_at, timezone.now())

        # Simulate second claim
        updated.next_attempt_at = timezone.now() - timedelta(seconds=1)
        updated.save()
        claim_outbox_batch(worker_id=worker_id)

        # Attempt 2 -> DEAD_LETTER
        final = record_outbox_failure(
            cmd.id,
            worker_id=worker_id,
            category=FailureCategory.TRANSIENT,
            error_code="CONNECTION_REFUSED",
            error_message="Still unreachable",
        )
        self.assertEqual(final.status, OutboxCommand.Status.DEAD_LETTER)
        self.assertEqual(final.attempt_count, 2)

    def test_record_outbox_permanent_rejection(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        worker_id = uuid4()
        claim_outbox_batch(worker_id=worker_id)

        updated = record_outbox_failure(
            cmd.id,
            worker_id=worker_id,
            category=FailureCategory.PERMANENT,
            error_code="VALIDATION_FAILED",
            error_message="Invalid partner_id",
        )
        self.assertEqual(updated.status, OutboxCommand.Status.REJECTED)

    def test_record_outbox_unknown_outcome(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        worker_id = uuid4()
        claim_outbox_batch(worker_id=worker_id)

        updated = record_outbox_failure(
            cmd.id,
            worker_id=worker_id,
            category=FailureCategory.UNKNOWN_OUTCOME,
            error_code="SOCKET_TIMEOUT_AFTER_COMMIT",
            error_message="Client timed out waiting for HTTP response",
        )
        self.assertEqual(updated.status, OutboxCommand.Status.OUTCOME_UNKNOWN)

    def test_lease_error_on_mismatched_worker(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        worker1 = uuid4()
        worker2 = uuid4()
        claim_outbox_batch(worker_id=worker1)

        with self.assertRaises(LeaseError):
            record_outbox_success(cmd.id, worker_id=worker2)

    def test_calculate_backoff_uses_exponential_power(self):
        delay0 = calculate_backoff(attempt=0, base_seconds=2.0, jitter=False)
        delay1 = calculate_backoff(attempt=1, base_seconds=2.0, jitter=False)
        delay2 = calculate_backoff(attempt=2, base_seconds=2.0, jitter=False)
        delay3 = calculate_backoff(attempt=3, base_seconds=2.0, jitter=False)

        self.assertEqual(delay0.total_seconds(), 2.0)
        self.assertEqual(delay1.total_seconds(), 4.0)
        self.assertEqual(delay2.total_seconds(), 8.0)
        self.assertEqual(delay3.total_seconds(), 16.0)

        # Cap test
        capped = calculate_backoff(attempt=20, base_seconds=1.0, max_seconds=60.0, jitter=False)
        self.assertEqual(capped.total_seconds(), 60.0)
