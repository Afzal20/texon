from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"permissions", views.PermissionViewSet, basename="permission")
router.register(r"roles", views.RoleViewSet, basename="role")
router.register(r"user-roles", views.UserRoleViewSet, basename="user-role")
router.register(r"my-permissions", views.MyPermissionsView, basename="my-permissions")

urlpatterns = [
    path("", include(router.urls)),
]
