"""RBAC management API.

The former GraphQL gateway exposed Role/RolePermission/UserRole to every
authenticated user (privilege escalation). These REST endpoints replace it:

- Permission / Role reads: any authenticated user (needed by profile pages).
- Writes and user↔role / role↔permission assignments: ``roles.manage`` RBAC
  permission only (superusers bypass via the permission helpers).
- ``/my-permissions/``: every authenticated user may inspect their own roles
  and effective permission codenames.
- Object-level API access: ``ObjectPermission`` should be added to viewsets
  that need per-instance RBAC filtering.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rbac.permissions import ObjectPermission, get_user_permissions, require_perms

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
    permission_classes = [IsAuthenticated, require_perms("roles.manage")]
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
        # The full role catalog (incl. permission codenames) is sensitive:
        # every action requires roles.manage — not just writes.
        return [IsAuthenticated(), require_perms("roles.manage")()]

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

    @action(detail=False, methods=["post"], url_path="bulk-assign")
    def bulk_assign(self, request):
        """Assign multiple roles to one user in a single request.

        Body: {"user": <pk>, "roles": [<role pk>, ...]}
        Existing assignments are kept; duplicates are ignored (idempotent).
        """
        user_pk = request.data.get("user")
        role_pks = request.data.get("roles")
        if not user_pk or not isinstance(role_pks, list) or not role_pks:
            raise ValidationError(
                {"detail": "Both 'user' and a non-empty 'roles' list are required."}
            )
        from django.contrib.auth import get_user_model

        User = get_user_model()
        try:
            target = User.objects.get(pk=user_pk)
        except User.DoesNotExist:
            raise ValidationError({"user": "User not found."})
        roles = Role.objects.filter(pk__in=role_pks)
        if roles.count() != len(set(role_pks)):
            raise ValidationError({"roles": "One or more roles do not exist."})
        created = [
            UserRole.objects.get_or_create(user=target, role=role)[0] for role in roles
        ]
        serializer = self.get_serializer(created, many=True)
        return Response(serializer.data)


class RolePermissionViewSet(viewsets.ModelViewSet):
    """Grant/revoke permissions for roles — roles.manage holders only."""

    queryset = (
        RolePermission.objects.select_related("role", "permission").all()
    )
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated, require_perms("roles.manage")]
    filterset_fields = ["role", "permission"]
    ordering_fields = ["id", "role"]


class MyPermissionsView(APIView):
    """Return the current user's roles and effective permission codenames.

    Any authenticated user may call this for themselves — it never exposes
    another user's data. Superusers receive every permission codename.
    Frontends use this to render menus / gate UI per role.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        roles = list(
            Role.objects.filter(user_roles__user=user)
            .distinct()
            .values("id", "name", "description")
        )
        return Response(
            {
                "is_superuser": user.is_superuser,
                "roles": roles,
                "permissions": sorted(get_user_permissions(user)),
            }
        )