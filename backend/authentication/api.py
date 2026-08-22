"""User management REST API.

Replaces the auto-generated User endpoints the GraphQL gateway used to expose
(any authenticated user could promote itself to superuser or reset someone's
password). Access is RBAC-driven:

- list/retrieve  -> users.view
- create         -> users.create
- update/patch   -> users.update
- delete         -> users.delete

Hardening enforced in the serializer/views regardless of permissions:
- ``is_staff`` / ``is_superuser`` are editable by superusers only.
- Passwords are write-only and hashable only by the account owner or a
  superuser.
- Non-superusers can never modify or delete superuser accounts.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from rbac.permissions import require_perms_for_actions

User = get_user_model()

PRIVILEGED_FIELDS = ("is_staff", "is_superuser")


class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        min_length=8,
        max_length=128,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "avatar",
            "is_active",
            "is_verified",
            "employee",
            "date_joined",
            "last_login",
        ) + PRIVILEGED_FIELDS + ("password",)
        read_only_fields = ("id", "date_joined", "last_login")

    def validate(self, attrs):
        request = self.context.get("request")
        requester = getattr(request, "user", None) if request else None
        target = self.instance

        # 1. Privileged flags: superuser only — strip silently otherwise.
        if requester is None or not requester.is_superuser:
            for field in PRIVILEGED_FIELDS:
                attrs.pop(field, None)

        # 2. Escalation target guard: nobody below superuser may mutate a
        #    superuser account (including its password via update).
        if (
            target is not None
            and requester is not None
            and not requester.is_superuser
            and target.is_superuser
        ):
            raise PermissionDenied("Superuser accounts can only be modified by superusers.")

        # 3. Password changes: the account owner or a superuser only.
        #    (An initial password on creation is allowed for users.create
        #    holders — without it newly created accounts are unusable.)
        if "password" in attrs and self.instance is not None:
            is_self = target is not None and requester is not None and target.pk == requester.pk
            if not (is_self or (requester is not None and requester.is_superuser)):
                raise PermissionDenied("You may only change your own password.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related("employee").order_by("-date_joined")
    serializer_class = UserManagementSerializer
    permission_classes = [
        IsAuthenticated,
        require_perms_for_actions(
            {
                "list": ("users.view",),
                "retrieve": ("users.view",),
                "create": ("users.create",),
                "update": ("users.update",),
                "partial_update": ("users.update",),
                "destroy": ("users.delete",),
            }
        ),
    ]
    filterset_fields = ["is_active", "is_staff", "is_verified"]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["email", "date_joined"]

    def perform_destroy(self, instance):
        requester = self.request.user
        if not requester.is_superuser and instance.is_superuser:
            raise PermissionDenied("Superuser accounts can only be deleted by superusers.")
        instance.delete()
