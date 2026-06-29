from rest_framework.permissions import BasePermission, DjangoModelPermissions


class IsOrganizationMember(BasePermission):
    """
    Ensures the authenticated user belongs to *some* organization.

    For object-level checks (has_object_permission), verifies the object's
    organization matches the user's organization.  Works with models that have
    either a direct ``organization`` FK **or** an indirect path through
    ``production_unit.organization`` / ``production_line.production_unit.organization``.
    """

    message = "You must belong to an organization to access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.organization_id is not None
        )

    # ------------------------------------------------------------------
    # Object-level: walk the FK chain to find the org and compare.
    # ------------------------------------------------------------------
    def has_object_permission(self, request, view, obj):
        user_org = request.user.organization_id

        # Direct FK
        if hasattr(obj, "organization_id"):
            return obj.organization_id == user_org

        # One hop: obj.production_unit.organization
        if hasattr(obj, "production_unit_id"):
            unit = getattr(obj, "production_unit", None)
            if unit is not None:
                return unit.organization_id == user_org

        # Two hops: obj.production_line.production_unit.organization
        if hasattr(obj, "production_line_id"):
            line = getattr(obj, "production_line", None)
            if line is not None:
                unit = getattr(line, "production_unit", None)
                if unit is not None:
                    return unit.organization_id == user_org

        return False


class IsProductionManager(BasePermission):
    """
    Allows access only to users who belong to the ``production_manager``
    Django auth group.
    """

    message = "Only production managers can perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.groups.filter(name="production_manager").exists()


class ProductionDjangoModelPermissions(DjangoModelPermissions):
    """
    Extends ``DjangoModelPermissions`` so that GET / HEAD / OPTIONS also
    require the ``view_<model>`` permission instead of being open by default.
    """

    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": [],
        "HEAD": [],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }


class IsProductionLineAccessible(BasePermission):
    """
    Object-level permission that checks whether a ``production_line``
    (referenced directly on the object or as the object itself) belongs
    to the requesting user's organization.
    """

    message = "You do not have access to this production line."

    def has_object_permission(self, request, view, obj):
        user_org = request.user.organization_id

        # The object *is* a ProductionLine
        if hasattr(obj, "production_unit"):
            unit = obj.production_unit
            return unit.organization_id == user_org

        # The object *has* a production_line FK
        if hasattr(obj, "production_line"):
            line = obj.production_line
            if line is not None:
                return line.production_unit.organization_id == user_org

        return False
