from rest_framework.permissions import BasePermission, IsAuthenticated
from django.contrib.contenttypes.models import ContentType


from .models import Permission as PermissionModel


def get_user_permissions(user, content_type=None, object_id=None):
    """Return a set of permission codenames for a given user.

    Loaded from DB on every call — never reads from JWT or session.
    Uses per-request cache so repeated checks within the same request
    hit memory instead of the database.

    Superusers implicitly hold every codomain.
    If ``content_type`` and ``object_id`` are provided, only permissions
    that match that specific object (or are global) are returned.

    Usage:
        # Global permissions only
        perms = get_user_permissions(user)

        # Permissions for a specific object instance
        perms = get_user_permissions(user, content_type=buyer_ct, object_id=buyer.id)
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
        cached = getattr(user, cache_key)
        # If object filter changed, invalidate and refetch
        if content_type is not None or object_id is not None:
            # Check if cached result was for global (no object filter)
            if not cached:
                # refetch with filter
                pass  # fall through to refetch
        # If we have object filters, we need to check those too
        if content_type is not None or object_id is not None:
            # Build filtered queryset
            perms = _get_user_permissions_for_object(user, content_type, object_id)
            setattr(user, cache_key, perms)
            return perms
        return cached

    perms = _get_user_permissions_for_object(user, content_type, object_id)
    setattr(user, cache_key, perms)
    return perms


def _get_user_permissions_for_object(user, content_type=None, object_id=None):
    """Internal helper: get permissions for user filtered by optional content_type/object_id."""
    qs = PermissionModel.objects.filter(
        role_permissions__role__user_roles__user=user,
    )
    if content_type is not None:
        qs = qs.filter(content_type=content_type)
    if object_id is not None:
        qs = qs.filter(object_id=object_id)
    return set(qs.values_list("codename", flat=True).distinct())


def invalidate_user_permissions_cache(user):
    """Call after role/permission changes to ensure fresh data."""
    cache_key = f"_request_perms_{user.pk}"
    if hasattr(user, cache_key):
        delattr(user, cache_key)


def has_object_permission(user, permission_codename, content_type, object_id):
    """Check if a user has a specific permission for a specific object.

    Returns True if the user has the permission codename either:
    - Globally (permission has no content_type/object_id), or
    - For the exact content_type and object_id combination.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True

    # Check if the permission exists and its scope
    try:
        perm = PermissionModel.objects.get(codename=permission_codename)
    except PermissionModel.DoesNotExist:
        return False

    # Global permission (no content_type restriction) grants access everywhere
    if perm.content_type is None and perm.object_id is None:
        return True

    # Object-specific permission: must match content_type and object_id
    if perm.content_type_id == content_type.pk and perm.object_id == str(object_id):
        return True

    return False


class IsSuperuser(BasePermission):
    """Allow only superusers (Django staff-level root access)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


def require_perms(*perms):
    """Factory that returns a DRF permission class requiring ALL specified perms.

    Superusers always pass. Usage in ViewSet:
        permission_classes = [IsAuthenticated, require_perms('users.view')]

    Usage in get_permissions():
        return [IsAuthenticated(), require_perms('users.create')()]
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


class ObjectPermission(BasePermission):
    """Allow access based on object-level RBAC permissions.

    This permission checks if the requesting user has the required permission
    codename for the specific object being accessed. It respects the permission's
    scope (global vs. object-specific).

    Usage in ViewSet:
        permission_classes = [IsAuthenticated, ObjectPermission]

    Usage with required perms:
        permission_classes = [IsAuthenticated, require_perms('inventory.view'), ObjectPermission]

    The permission can also be used with `has_object_permission` style checks
    where the view provides the `permission_codename` via lookup fields or
    view attributes.
    """

    def has_permission(self, request, view):
        # If view has no required perm codename, allow (object check happens in has_object_permission)
        if not getattr(view, "required_perm_codename", None):
            return True
        return request.user.is_authenticated and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Check if the user has the required permission for this specific object.

        The view must set ``required_perm_codename`` (a string or tuple of strings)
        to specify which permission(s) are required for object-level access.

        If the permission is globally scoped (no content_type/object_id),
        access is granted. If it's object-scoped, the permission's content_type
        and object_id must match the object being accessed.
        """
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True

        required = getattr(view, "required_perm_codename", None)
        if not required:
            return True

        # Handle single codename or tuple of codenames
        codenames = required if isinstance(required, (list, tuple)) else (required,)

        # Must pass ALL required codenames
        all_passed = True
        for codename in codenames:
            if not _user_has_object_perm(user, codename, obj):
                all_passed = False
                break

        return all_passed


def _user_has_object_perm(user, permission_codename, obj):
    """Check if user has a specific permission for a specific object instance."""
    try:
        perm = PermissionModel.objects.get(codename=permission_codename)
    except PermissionModel.DoesNotExist:
        return False

    # Global permission (no content_type or object_id restrictions)
    if perm.content_type is None and perm.object_id is None:
        return True

    # Object-specific permission: must match content_type and object_id
    from django.contrib.contenttypes.models import ContentType
    obj_ct = ContentType.objects.get_for_model(obj)
    if perm.content_type_id == obj_ct.pk and perm.object_id == str(obj.pk):
        return True

    return False
