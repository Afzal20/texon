from uuid import UUID, uuid4

from rest_framework import permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .dispatcher import dispatch_single_command
from .models import OutboxCommand
from .odoo_client import OdooClient
from .outbox import claim_outbox_batch


def _can_access_operation(user, command: OutboxCommand) -> bool:
    """Validate that the requesting actor has permission to view or manage the operation."""
    if user.is_superuser or user.is_staff:
        return True
    user_ref = getattr(user, "email", str(user.pk))
    if command.actor_id in (user_ref, str(user.pk)):
        return True
    # If the user has an associated company or employee location
    user_company_id = getattr(user, "company_id", None)
    if user_company_id and user_company_id == command.company_id:
        return True
    return False


def _serialize_operation(command: OutboxCommand) -> dict:
    return {
        "operation_uuid": str(command.operation_uuid),
        "status": command.status,
        "command_name": command.command_name,
        "aggregate_id": command.aggregate_id,
        "company_id": command.company_id,
        "attempt_count": command.attempt_count,
        "max_attempts": command.max_attempts,
        "next_attempt_at": command.next_attempt_at.isoformat() if command.next_attempt_at else None,
        "response_data": command.response_data,
        "error_code": command.error_code,
        "error_message": command.error_message,
        "created_at": command.created_at.isoformat(),
        "updated_at": command.updated_at.isoformat(),
    }


class OperationStatusView(APIView):
    """Retrieve truthful status and execution receipts for an asynchronous command."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, operation_uuid):
        try:
            op_uuid = UUID(str(operation_uuid))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid operation UUID."}, status=status.HTTP_400_BAD_REQUEST)

        command = OutboxCommand.objects.filter(operation_uuid=op_uuid).first()
        if not command:
            return Response({"detail": "Operation not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _can_access_operation(request.user, command):
            raise PermissionDenied("You do not have access to this operation.")

        return Response(_serialize_operation(command), status=status.HTTP_200_OK)


class OperationReplayView(APIView):
    """Request safe, authorized replay of an uncertain or dead-letter operation."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, operation_uuid):
        try:
            op_uuid = UUID(str(operation_uuid))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid operation UUID."}, status=status.HTTP_400_BAD_REQUEST)

        command = OutboxCommand.objects.filter(operation_uuid=op_uuid).first()
        if not command:
            return Response({"detail": "Operation not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _can_access_operation(request.user, command):
            raise PermissionDenied("You do not have access to replay this operation.")

        # Replay is only permitted for operations whose outcome is uncertain or dead-lettered
        if command.status in (OutboxCommand.Status.OUTCOME_UNKNOWN, OutboxCommand.Status.DEAD_LETTER, OutboxCommand.Status.RETRY_WAIT):
            # Claim directly for synchronous replay attempt
            worker_id = uuid4()
            command.status = OutboxCommand.Status.CLAIMED
            command.lease_token = worker_id
            command.save(update_fields=["status", "lease_token", "updated_at"])

            client = OdooClient()
            command = dispatch_single_command(command, worker_id=worker_id, client=client)

        return Response(_serialize_operation(command), status=status.HTTP_200_OK)
