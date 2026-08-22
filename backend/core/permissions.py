from rest_framework import permissions

DEPARTMENT_TIER_MAP = {
    "Cutting": "production",
    "Sewing": "production",
    "Finishing": "production",
    "Quality Control": "qc",
    "Finance & Accounts": "finance",
    "Human Resources": "hr",
    "Merchandising": "sales",
    "Administration": "admin",
    "IT": "admin",
}


def get_department_tier(user):
    if user.is_superuser:
        return "admin"
    if not hasattr(user, "employee") or user.employee is None or user.employee.department is None:
        return None
    return DEPARTMENT_TIER_MAP.get(user.employee.department.name)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Authenticated read access; writes require staff.

    NOTE: safe methods still require an authenticated user (the previous
    version allowed anonymous reads, which is never desirable for ERP data).
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return user.is_staff


class IsObjectOwnerOrStaff(permissions.BasePermission):
    """Object-level guard: only the row's owner (or staff) may touch it.

    Works together with OwnerQuerysetMixin: the mixin scopes the queryset so
    foreign rows 404 on retrieve/update/delete; this permission additionally
    blocks writes to objects the user can see but does not own.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        from core.mixins import get_owner_field

        owner_field = get_owner_field(type(obj))
        if owner_field is None:
            # No ownership relation: fall back to model-level permissions.
            return True
        owner = getattr(obj, owner_field)
        if owner is None:
            return False
        return owner.id == user.id


class _TierPermission(permissions.BasePermission):
    tier = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        user_tier = get_department_tier(request.user)
        if user_tier is None:
            return False
        return user_tier == self.tier


class IsFinanceRole(_TierPermission):
    tier = "finance"


class IsHRRole(_TierPermission):
    tier = "hr"


class IsProductionStaff(_TierPermission):
    tier = "production"


class IsQCRole(_TierPermission):
    tier = "qc"


class IsSalesRole(_TierPermission):
    tier = "sales"


class IsAdminRole(_TierPermission):
    tier = "admin"