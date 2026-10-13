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
            dispatch_single_command(command, worker_id=worker_id, client=client)
            command.refresh_from_db()

        return Response(_serialize_operation(command), status=status.HTTP_200_OK)


class OperationListView(APIView):
    """List recent integration commands and receipts visible to the current user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = OutboxCommand.objects.all().order_by("-id")
        if not (request.user.is_superuser or request.user.is_staff):
            user_ref = getattr(request.user, "email", str(request.user.pk))
            queryset = queryset.filter(actor_id__in=[user_ref, str(request.user.pk)])

        limit = min(int(request.query_params.get("limit", 30)), 100)
        commands = queryset[:limit]
        return Response([_serialize_operation(cmd) for cmd in commands], status=status.HTTP_200_OK)


class CommandSubmissionView(APIView):
    """Authorized endpoint for submitting business commands to the transactional outbox."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        command_name = data.get("command_name")
        parameters = data.get("parameters")
        aggregate_id = data.get("aggregate_id") or "AGG"

        if not command_name or not isinstance(parameters, dict):
            return Response(
                {"detail": "command_name and parameters object are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company_id = int(data.get("company_id") or getattr(request.user, "company_id", None) or 1)
        actor_id = getattr(request.user, "email", str(request.user.pk))
        tenant_id = data.get("tenant_id") or "texon-default"
        expected_revision = data.get("expected_revision")

        from .outbox import enqueue_command

        try:
            command = enqueue_command(
                tenant_id=tenant_id,
                company_id=company_id,
                actor_id=actor_id,
                command_name=command_name,
                aggregate_id=aggregate_id,
                parameters=parameters,
                expected_revision=expected_revision,
            )
        except Exception as e:
            return Response({"detail": f"Failed to enqueue command: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # Trigger immediate execution pass so caller gets rapid feedback if worker is idle
        try:
            worker_id = uuid4()
            command.status = OutboxCommand.Status.CLAIMED
            command.lease_token = worker_id
            command.save(update_fields=["status", "lease_token", "updated_at"])
            client = OdooClient()
            dispatch_single_command(command, worker_id=worker_id, client=client)
        except Exception:
            # If immediate pass hits an error, the background worker handles retry
            pass

        command.refresh_from_db()
        return Response(_serialize_operation(command), status=status.HTTP_202_ACCEPTED)


class OdooWorkspaceView(APIView):
    """Read authoritative data directly from Odoo for the current user's workspace."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        section = request.query_params.get("section", "sales")
        company_id = int(request.query_params.get("company_id") or 1)
        limit = min(int(request.query_params.get("limit", 20)), 100)
        offset = max(int(request.query_params.get("offset", 0)), 0)

        client = OdooClient()
        try:
            data = client.read_workspace(company_id=company_id, section=section, limit=limit, offset=offset)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": f"Odoo workspace unavailable: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

