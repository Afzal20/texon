from rest_framework import serializers

from .models import Permission, Role, UserRole
from .permissions import invalidate_user_permissions_cache


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "codename", "label", "group")


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SlugRelatedField(
        many=True,
        slug_field="codename",
        queryset=Permission.objects.all(),
    )

    class Meta:
        model = Role
        fields = ("id", "name", "description", "permissions", "is_system")
        read_only_fields = ("is_system",)


class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = UserRole
        fields = ("id", "user", "role", "role_name")

    def validate(self, attrs):
        user = attrs["user"]
        role = attrs["role"]
        if UserRole.objects.filter(user=user, role=role).exists():
            raise serializers.ValidationError("User already has this role.")
        return attrs

    def create(self, validated_data):
        instance = super().create(validated_data)
        invalidate_user_permissions_cache(instance.user)
        return instance

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        invalidate_user_permissions_cache(instance.user)
        return instance
