"""RBAC management API.

The former GraphQL gateway exposed Role/RolePermission/UserRole to every
authenticated user (privilege escalation). These REST endpoints replace it:

- Permission / Role reads: any authenticated user (needed by profile pages).
- Writes and user↔role / role↔permission assignments: ``roles.manage`` RBAC
  permission only (superusers bypass via the permission helpers).
"""

from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from rbac.permissions import require_perms

from .models import Permission, Role, RolePermission, UserRole
from .serializers import (
    PermissionSerializer,
    RolePermissionSerializer,
    RoleSerializer,
    UserRoleSerializer,
)


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["group"]
    search_fields = ["codename", "label"]
    ordering_fields = ["codename", "group"]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related("permissions").all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_system"]
    search_fields = ["name", "description"]
    ordering_fields = ["name"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), require_perms("roles.manage")()]
        return super().get_permissions()

    def perform_destroy(self, instance):
        if instance.is_system:
            raise ValidationError({"detail": "System roles cannot be deleted."})
        instance.delete()


class UserRoleViewSet(viewsets.ModelViewSet):
    """Assign/revoke roles for users — roles.manage holders only."""

    queryset = (
        UserRole.objects.select_related("user", "role").all()
    )
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, require_perms("roles.manage")]
    filterset_fields = ["user", "role"]
    ordering_fields = ["id", "role"]


class RolePermissionViewSet(viewsets.ModelViewSet):
    """Grant/revoke permissions for roles — roles.manage holders only."""

    queryset = (
        RolePermission.objects.select_related("role", "permission").all()
    )
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated, require_perms("roles.manage")]
    filterset_fields = ["role", "permission"]
    ordering_fields = ["id", "role"]
