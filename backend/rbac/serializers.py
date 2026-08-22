from rest_framework import serializers

from .models import Permission, Role, RolePermission, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "codename", "label", "group")
        read_only_fields = ("id",)


class RoleSerializer(serializers.ModelSerializer):
    permission_codenames = serializers.SlugRelatedField(
        source="permissions",
        slug_field="codename",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "description",
            "is_system",
            "permission_codenames",
        )
        read_only_fields = ("id",)


class UserRoleSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = UserRole
        fields = ("id", "user", "role", "user_email", "role_name")
        read_only_fields = ("id",)


class RolePermissionSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    permission_codename = serializers.CharField(source="permission.codename", read_only=True)

    class Meta:
        model = RolePermission
        fields = ("id", "role", "permission", "role_name", "permission_codename")
        read_only_fields = ("id",)
