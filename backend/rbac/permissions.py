from rest_framework.permissions import BasePermission, IsAuthenticated

from .models import Permission as PermissionModel


def get_user_permissions(user):
    """Return a set of permission codenames for a given user.

    Loaded from DB on every call — never reads from JWT or session.
    Uses per-request cache so repeated checks within the same request
    hit memory instead of the database.

    Superusers implicitly hold every codename.
    """
    if not user or not user.is_authenticated:
        return set()
    if user.is_superuser:
        cache_key = f"_request_perms_{user.pk}"
        if hasattr(user, cache_key):
            return getattr(user, cache_key)
        perms = set(PermissionModel.objects.values_list("codename", flat=True))
        setattr(user, cache_key, perms)
        return perms

    cache_key = f"_request_perms_{user.pk}"
    if hasattr(user, cache_key):
        return getattr(user, cache_key)

    perms = set(
        PermissionModel.objects.filter(
            role_permissions__role__user_roles__user=user,
        )
        .values_list("codename", flat=True)
        .distinct()
    )
    setattr(user, cache_key, perms)
    return perms


def invalidate_user_permissions_cache(user):
    """Call after role/permission changes to ensure fresh data."""
    cache_key = f"_request_perms_{user.pk}"
    if hasattr(user, cache_key):
        delattr(user, cache_key)


class IsSuperuser(BasePermission):
    """Allow only superusers (Django staff-level root access)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


def require_perms(*perms):
    """Factory that returns a DRF permission class requiring ALL specified perms.

    Superusers always pass. Usage in ViewSet:
        permission_classes = [IsAuthenticated, require_perms('users.view')]

    Usage in get_permissions():
        return [IsAuthenticated(), require_perms('users.view')()]
    """
    class _RequirePerms(IsAuthenticated):
        required = perms

        def has_permission(self, request, view):
            if not super().has_permission(request, view):
                return False
            if request.user.is_superuser or not self.required:
                return True
            user_perms = get_user_permissions(request.user)
            return all(p in user_perms for p in self.required)

    return _RequirePerms


def require_any_perm(*perms):
    """Factory returning a DRF permission class requiring ANY of the specified perms.

    Superusers always pass.
    """
    class _RequireAnyPerm(IsAuthenticated):
        required = perms

        def has_permission(self, request, view):
            if not super().has_permission(request, view):
                return False
            if request.user.is_superuser or not self.required:
                return True
            user_perms = get_user_permissions(request.user)
            return any(p in user_perms for p in self.required)

    return _RequireAnyPerm


def require_permission(*perms):
    """Decorator for function-based views.

    Usage:
        @api_view(['GET'])
        @require_permission('users.view')
        def my_view(request):
            ...
    """
    from rest_framework.decorators import permission_classes as drf_permission_classes

    return drf_permission_classes([require_perms(*perms)])


def require_perms_for_actions(action_map, default=None):
    """Permission class resolving required RBAC perms per ViewSet action.

    Superusers always pass. Actions absent from ``action_map`` fall back to
    ``default`` (None = allow any authenticated user).

    Usage:
        class UserViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, require_perms_for_actions({
                "list": ("users.view",),
                "retrieve": ("users.view",),
                "create": ("users.create",),
                "update": ("users.update",),
                "partial_update": ("users.update",),
                "destroy": ("users.delete",),
            })]
    """
    required_map = dict(action_map)

    class _RequirePermsForActions(IsAuthenticated):
        default_required = default

        def has_permission(self, request, view):
            if not super().has_permission(request, view):
                return False
            user = request.user
            if user.is_superuser:
                return True
            required = required_map.get(getattr(view, "action", None), self.default_required)
            if not required:
                return True
            user_perms = get_user_permissions(user)
            return all(p in user_perms for p in required)

    return _RequirePermsForActions
