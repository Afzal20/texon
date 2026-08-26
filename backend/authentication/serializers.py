from rest_framework import serializers
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.serializers import RegisterSerializer as DjRestAuthRegisterSerializer

User = get_user_model()


class UserDetailsSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = User
        fields = (
            "pk",
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "avatar",
            "is_verified",
            "is_superuser",
            "is_staff",
            "date_joined",
        )
        read_only_fields = ("pk", "id", "email", "is_verified", "is_superuser", "is_staff", "date_joined")

class RegisterSerializer(DjRestAuthRegisterSerializer):
    """Email-only registration.

    The custom user model has no username field (ACCOUNT_USER_MODEL_USERNAME_FIELD=None),
    which makes dj-rest-auth's default serializer declare `username` with
    max_length=0 — an impossible constraint that broke signup entirely. Here the
    field is optional/blank; allauth skips username handling when it is disabled.
    """

    username = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        # Drop the placeholder so nothing downstream tries to store it.
        attrs.pop("username", None)
        return super().validate(attrs)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop("username", None)
        return data
