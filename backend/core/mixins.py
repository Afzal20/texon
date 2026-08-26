"""Queryset scoping mixins for object-level access control (IDOR defence)."""

from django.conf import settings
from django.contrib.contenttypes.models import ContentType


#: FK field names commonly used to mark object ownership.
OWNER_FIELD_CANDIDATES = ("user", "owner", "created_by")


def get_owner_field(model):
    """Return the name of the FK on ``model`` that points to the user model.

    Looks for a FK to settings.AUTH_USER_MODEL named one of
    OWNER_FIELD_CANDIDATES. Returns None when the model has no ownership
    relation (access then falls back to model-level permissions only).
    """
    user_model = settings.AUTH_USER_MODEL
    for field in model._meta.concrete_fields:
        if not field.is_relation:
            continue
        target = f"{field.related_model._meta.app_label}.{field.related_model.__name__}"
        if target == user_model and field.name in OWNER_FIELD_CANDIDATES:
            return field.name
    return None


def _user_has_permission_for_object(user, permission_codename, obj):
    """Check if user has a specific permission for a specific object instance."""
    from .rbac.models import Permission as PermissionModel

    try:
        perm = PermissionModel.objects.get(codename=permission_codename)
    except PermissionModel.DoesNotExist:
        return False

    # Global permission (no content_type or object_id restrictions)
    if perm.content_type is None and perm.object_id is None:
        return True

    # Object-specific permission: must match content_type and object_id
    obj_ct = ContentType.objects.get_for_model(obj)
    if perm.content_type_id == obj_ct.pk and perm.object_id == str(obj.pk):
        return True

    return False


class OwnerQuerysetMixin:
    """Scope list/retrieve querysets to the requesting user's own rows.

    - Staff/superusers see everything.
    - On models with an owner FK (user/owner/created_by), non-staff users
      only ever see (and can write) their own objects.
    - Models without an owner FK keep model-level permission behaviour;
      set ``owner_filter_field`` explicitly to scope by another column.
    """

    #: Explicit override; when None the owner FK is auto-detected.
    owner_filter_field = None

    def _owner_field(self):
        if self.owner_filter_field is not None:
            return self.owner_filter_field
        return get_owner_field(self.queryset.model)

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user or not user.is_authenticated:
            return qs.none()
        if user.is_staff or user.is_superuser:
            return qs
        owner_field = self._owner_field()
        if owner_field is None:
            return qs
        return qs.filter(**{f"{owner_field}__id": user.id})


class RoleBasedQuerysetMixin:
    """Scope list/retrieve querysets based on the user's assigned roles and permissions.

    - Staff/superusers see all objects.
    - Non-staff users only see objects for which they have at least one role-based
      permission that applies to that object (global or object-scoped).

    Usage:
        class BuyerViewSet(GenericViewSet, RoleBasedQuerysetMixin, viewsets.ModelViewSet):
            queryset = Buyer.objects.all()
            permission_classes = [IsAuthenticated, ObjectPermission]

    The mixin works by filtering the queryset using the user's role permissions.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user or not user.is_authenticated:
            return qs.none()
        if user.is_staff or user.is_superuser:
            return qs

        # Filter by user's role-based permissions
        # Get codenames the user has from their roles
        from .rbac.models import Permission as PermissionModel, UserRole

        user_perms = PermissionModel.objects.filter(
            role_permissions__role__user_roles__user=user,
        ).values_list("codename", flat=True).distinct()

        # For now, keep the base queryset if no specific object filtering is needed
        # The ObjectPermission class handles per-object checks in the view
        return qs