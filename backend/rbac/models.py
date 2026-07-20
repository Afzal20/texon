from django.db import models
from django.conf import settings


class Permission(models.Model):
    codename = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=255)
    group = models.CharField(max_length=100, blank=True, help_text="Logical grouping e.g. 'users', 'salary', 'inventory'")

    class Meta:
        ordering = ["group", "codename"]
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self):
        return self.codename


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(
        Permission,
        through="RolePermission",
        related_name="roles",
    )
    is_system = models.BooleanField(
        default=False,
        help_text="System roles cannot be deleted",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="role_permissions")

    class Meta:
        unique_together = ("role", "permission")
        verbose_name = "Role permission"
        verbose_name_plural = "Role permissions"

    def __str__(self):
        return f"{self.role.name} → {self.permission.codename}"


class UserRole(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="user_roles")

    class Meta:
        unique_together = ("user", "role")
        verbose_name = "User role"
        verbose_name_plural = "User roles"

    def __str__(self):
        return f"{self.user.email} → {self.role.name}"
