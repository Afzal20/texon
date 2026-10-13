from unittest.mock import MagicMock
from uuid import uuid4

from django.test import TestCase

from .dispatcher import dispatch_single_command, process_outbox_batch
from .models import OutboxCommand
from .odoo_client import (
    OdooBusinessError,
    OdooClient,
    OdooTimeoutError,
    OdooTransientError,
)
from .outbox import claim_outbox_batch, enqueue_command


class DispatcherTests(TestCase):
    def setUp(self):
        self.tenant_id = "tenant-test"
        self.company_id = 1
        self.actor_id = "user-123"
        self.command_name = "sales.create"
        self.aggregate_id = "SO-2026-001"
        self.parameters = {"client_order_ref": "PO-100", "partner_id": 1, "lines": []}
        self.worker_id = uuid4()

    def test_dispatch_success(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        claim_outbox_batch(worker_id=self.worker_id)
        cmd.refresh_from_db()

        mock_client = MagicMock(spec=OdooClient)
        mock_client.execute_atomic_command.return_value = {
            "id": 10,
            "name": "S00010",
            "state": "draft",
        }

        updated = dispatch_single_command(cmd, worker_id=self.worker_id, client=mock_client)

        self.assertEqual(updated.status, OutboxCommand.Status.SUCCEEDED)
        self.assertEqual(updated.response_data["name"], "S00010")
        mock_client.execute_atomic_command.assert_called_once_with(
            operation_uuid=cmd.operation_uuid,
            company_id=1,
            command_name="sales.create",
            payload=self.parameters,
            actor_id="user-123",
        )

    def test_dispatch_timeout_marks_outcome_unknown(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        claim_outbox_batch(worker_id=self.worker_id)
        cmd.refresh_from_db()

        mock_client = MagicMock(spec=OdooClient)
        mock_client.execute_atomic_command.side_effect = OdooTimeoutError("Timed out")

        updated = dispatch_single_command(cmd, worker_id=self.worker_id, client=mock_client)

        self.assertEqual(updated.status, OutboxCommand.Status.OUTCOME_UNKNOWN)
        self.assertEqual(updated.error_code, "TIMEOUT_AFTER_DISPATCH")

    def test_dispatch_transient_error_marks_retry_wait(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        claim_outbox_batch(worker_id=self.worker_id)
        cmd.refresh_from_db()

        mock_client = MagicMock(spec=OdooClient)
        mock_client.execute_atomic_command.side_effect = OdooTransientError("Connection refused")

        updated = dispatch_single_command(cmd, worker_id=self.worker_id, client=mock_client)

        self.assertEqual(updated.status, OutboxCommand.Status.RETRY_WAIT)
        self.assertEqual(updated.attempt_count, 1)

    def test_dispatch_business_rejection_marks_rejected(self):
        cmd = enqueue_command(
            tenant_id=self.tenant_id,
            company_id=self.company_id,
            actor_id=self.actor_id,
            command_name=self.command_name,
            aggregate_id=self.aggregate_id,
            parameters=self.parameters,
        )
        claim_outbox_batch(worker_id=self.worker_id)
        cmd.refresh_from_db()

        mock_client = MagicMock(spec=OdooClient)
        mock_client.execute_atomic_command.side_effect = OdooBusinessError("ValidationError: Invalid buyer")

        updated = dispatch_single_command(cmd, worker_id=self.worker_id, client=mock_client)

        self.assertEqual(updated.status, OutboxCommand.Status.REJECTED)
        self.assertEqual(updated.error_code, "BUSINESS_REJECTION")

    def test_process_outbox_batch_flow(self):
        for i in range(3):
            enqueue_command(
                tenant_id=self.tenant_id,
                company_id=self.company_id,
                actor_id=self.actor_id,
                command_name=self.command_name,
                aggregate_id=f"SO-{i}",
                parameters=self.parameters,
            )

        mock_client = MagicMock(spec=OdooClient)
        mock_client.execute_atomic_command.return_value = {"id": 1, "state": "draft"}

        count = process_outbox_batch(worker_id=self.worker_id, batch_size=5, client=mock_client)
        self.assertEqual(count, 3)
        self.assertEqual(
            OutboxCommand.objects.filter(status=OutboxCommand.Status.SUCCEEDED).count(), 3
        )
