from django.conf import settings
from django.contrib.contenttypes.fields import ContentType
from django.db import models


def _permission_content_type(model_or_app_label=None, model_name=None):
    """Helper to resolve a ContentType from a model class or app.label/model_name."""
    from django.contrib.contenttypes.models import ContentType as _CT
    if model_or_app_label is None and model_name is None:
        return None
    if model_or_app_label and isinstance(model_or_app_label, type):
        return _CT.for_model(model_or_app_label)
    if model_or_app_label and "." in model_or_app_label:
        app_label, model_name = model_or_app_label.split(".", 1)
        return _CT.objects.get_by_natural_key(model_or_app_label)
    return _CT.objects.get_by_natural_key(model_name, app_label=model_or_app_label)


class Permission(models.Model):
    codename = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=255)
    group = models.CharField(
        max_length=100,
        blank=True,
        help_text="Logical grouping e.g. 'users', 'salary', 'inventory'",
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="rbac_permissions",
        help_text="Optional: filter permission to a specific model (e.g. buyers.Buyer). "
                  "If null, permission applies globally to the model type.",
    )
    object_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Optional: filter permission to a specific object instance ID. "
                  "Used together with content_type for per-object access.",
    )

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
        ordering = ["-id"]
        unique_together = ("role", "permission")
        verbose_name = "RolePermission"
        verbose_name_plural = "RolePermissions"

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
        ordering = ["-id"]
        unique_together = ("user", "role")
        verbose_name = "UserRole"
        verbose_name_plural = "UserRoles"

    def __str__(self):
        return f"{self.user.email} → {self.role.name}"
