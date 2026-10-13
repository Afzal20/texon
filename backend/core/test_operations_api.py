from unittest.mock import MagicMock, patch
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import OutboxCommand
from .outbox import enqueue_command

User = get_user_model()


class OperationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="merchandiser@example.com",
            password="testpassword123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="testpassword123",
        )
        self.staff_user = User.objects.create_user(
            email="admin@example.com",
            password="testpassword123",
            is_staff=True,
        )

        self.cmd = enqueue_command(
            tenant_id="tenant-1",
            company_id=1,
            actor_id="merchandiser@example.com",
            command_name="sales.create",
            aggregate_id="SO-100",
            parameters={"client_order_ref": "PO-100", "partner_id": 1, "lines": []},
        )

    def test_unauthenticated_access_denied(self):
        url = reverse("operation-status", kwargs={"operation_uuid": self.cmd.operation_uuid})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_can_read_operation_status(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("operation-status", kwargs={"operation_uuid": self.cmd.operation_uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["operation_uuid"], str(self.cmd.operation_uuid))
        self.assertEqual(data["status"], OutboxCommand.Status.PENDING)
        self.assertEqual(data["command_name"], "sales.create")
        self.assertEqual(data["company_id"], 1)

    def test_unrelated_user_is_forbidden(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse("operation-status", kwargs={"operation_uuid": self.cmd.operation_uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_user_can_read_any_operation(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("operation-status", kwargs={"operation_uuid": self.cmd.operation_uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_operation_not_found(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("operation-status", kwargs={"operation_uuid": uuid4()})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("core.views_operations.dispatch_single_command")
    @patch("core.views_operations.OdooClient")
    def test_replay_outcome_unknown_invokes_dispatcher(self, mock_client_cls, mock_dispatch):
        self.cmd.status = OutboxCommand.Status.OUTCOME_UNKNOWN
        self.cmd.save()

        mock_dispatch.return_value = self.cmd

        self.client.force_authenticate(user=self.user)
        url = reverse("operation-replay", kwargs={"operation_uuid": self.cmd.operation_uuid})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_dispatch.assert_called_once()

    def test_replay_denied_for_unrelated_user(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse("operation-replay", kwargs={"operation_uuid": self.cmd.operation_uuid})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
