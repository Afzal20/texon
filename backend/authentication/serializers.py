from rest_framework import serializers
from django.contrib.auth import get_user_model

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