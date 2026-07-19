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
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user


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
