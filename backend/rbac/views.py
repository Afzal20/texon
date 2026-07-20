from django.contrib.auth import get_user_model

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Permission, Role, UserRole
from .permissions import (
    require_perms,
    require_any_perm,
    get_user_permissions,
    invalidate_user_permissions_cache,
)
from .serializers import PermissionSerializer, RoleSerializer, UserRoleSerializer

User = get_user_model()


class PermissionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, require_perms("rbac.view_permission")]
    filterset_fields = ["group"]
    search_fields = ["codename", "label"]


class RoleViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Role.objects.prefetch_related("permissions").all()
    serializer_class = RoleSerializer
    search_fields = ["name"]

    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated(), require_perms("rbac.view_role")()]
        if self.action == "retrieve":
            return [IsAuthenticated(), require_perms("rbac.view_role")()]
        if self.action in ("create", "update", "partial_update"):
            return [IsAuthenticated(), require_any_perm("rbac.add_role", "rbac.change_role")()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        old_perms = set(
            self.get_object().permissions.values_list("codename", flat=True)
        )
        instance = serializer.save()
        new_perms = set(instance.permissions.values_list("codename", flat=True))
        if old_perms != new_perms:
            for user in User.objects.filter(user_roles__role=instance):
                invalidate_user_permissions_cache(user)


class UserRoleViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = UserRole.objects.select_related("user", "role").all()
    serializer_class = UserRoleSerializer
    filterset_fields = ["user", "role"]

    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated(), require_perms("rbac.view_userrole")()]
        return [IsAuthenticated(), require_perms("rbac.manage_userrole")()]


class MyPermissionsView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        perms = get_user_permissions(user)
        roles = list(user.user_roles.values_list("role__name", flat=True))
        return Response({
            "permissions": sorted(perms),
            "roles": roles,
        })
