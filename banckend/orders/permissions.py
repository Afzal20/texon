from rest_framework.permissions import BasePermission

class IsOrganizationMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.organization is not None
