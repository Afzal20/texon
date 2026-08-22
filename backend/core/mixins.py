"""Queryset scoping mixins for object-level access control (IDOR defence)."""

from django.conf import settings


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


class OwnerQuerysetMixin:
    """Scope list/retrieve querysets to the requesting user's own rows.

    - Staff/superusers see everything.
    - On models with an owner FK (user/owner/created_by), non-staff users
      only ever see (and can only write) their own objects.
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