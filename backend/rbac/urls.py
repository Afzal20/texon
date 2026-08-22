from rest_framework.routers import DefaultRouter

from .views import PermissionViewSet, RolePermissionViewSet, RoleViewSet, UserRoleViewSet

router = DefaultRouter()
router.register("permissions", PermissionViewSet, basename="permissions")
router.register("roles", RoleViewSet, basename="roles")
router.register("user-roles", UserRoleViewSet, basename="user-roles")
router.register("role-permissions", RolePermissionViewSet, basename="role-permissions")

urlpatterns = router.urls
