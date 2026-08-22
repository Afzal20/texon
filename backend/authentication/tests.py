"""Security regression tests for the user management API.

These pin down the fixes for the account-takeover / privilege-escalation hole
the GraphQL gateway used to have:

- ``/api/v1/users/`` is RBAC-guarded (users.view/create/update/delete).
- Non-superusers can never grant ``is_staff``/``is_superuser``.
- Non-superusers can never mutate or delete superuser accounts.
- Passwords are only settable by the account owner or a superuser.
"""

from uuid import uuid4

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from rbac.models import Permission, Role, RolePermission, UserRole

User = get_user_model()


def _unique(email_base):
    return f"{email_base.replace('@', '+')}_{uuid4().hex[:8]}@test.texon.com"


def make_user(email, is_superuser=False, is_staff=False):
    return User.objects.create_user(
        email=email,
        password="StrongPass!123",
        first_name="Test",
        last_name="User",
        is_staff=is_staff,
        is_verified=True,
        **({"is_superuser": True} if is_superuser else {}),
    )


def grant_roles(user, *codenames):
    role = Role.objects.create(name=f"role-{uuid4().hex[:10]}")
    for codename in codenames:
        perm, _ = Permission.objects.get_or_create(
            codename=codename, defaults={"label": codename, "group": "users"}
        )
        RolePermission.objects.get_or_create(role=role, permission=perm)
    UserRole.objects.create(user=user, role=role)


class UserEndpointAccessTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.superuser = make_user(_unique("super"), is_superuser=True, is_staff=True)
        self.plain = make_user(_unique("plain"))
        self.viewer = make_user(_unique("viewer"))
        grant_roles(self.viewer, "users.view")
        self.editor = make_user(_unique("editor"))
        grant_roles(self.editor, "users.view", "users.create", "users.update", "users.delete")

    def test_anonymous_denied(self):
        res = self.client.get(reverse("users-list"))
        self.assertIn(res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_plain_user_cannot_list_users(self):
        self.client.force_authenticate(self.plain)
        res = self.client.get(reverse("users-list"))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_users_view_holder_can_list(self):
        self.client.force_authenticate(self.viewer)
        res = self.client.get(reverse("users-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_view_holder_cannot_create_or_delete(self):
        self.client.force_authenticate(self.viewer)
        payload = {"email": _unique("new"), "password": "AnotherPass!123"}
        self.assertEqual(
            self.client.post(reverse("users-list"), payload, format="json").status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.delete(reverse("users-detail", args=[self.plain.pk])).status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_editor_cannot_escalate_to_superuser(self):
        self.client.force_authenticate(self.editor)
        # On creation…
        res = self.client.post(
            reverse("users-list"),
            {
                "email": _unique("created"),
                "password": "AnotherPass!123",
                "is_superuser": True,
                "is_staff": True,
            },
            format="json",
        )
        self.assertIn(res.status_code, (status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST))
        if res.status_code == status.HTTP_201_CREATED:
            created = User.objects.get(pk=res.data["id"])
            self.assertFalse(created.is_superuser)
            self.assertFalse(created.is_staff)
        # …and on update.
        res = self.client.patch(
            reverse("users-detail", args=[self.plain.pk]),
            {"is_superuser": True},
            format="json",
        )
        self.assertIn(res.status_code, (status.HTTP_200_OK, status.HTTP_403_FORBIDDEN))
        self.plain.refresh_from_db()
        self.assertFalse(self.plain.is_superuser)

    def test_editor_cannot_modify_superuser_account(self):
        self.client.force_authenticate(self.editor)
        res = self.client.patch(
            reverse("users-detail", args=[self.superuser.pk]), {"first_name": "Hacked"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.superuser.refresh_from_db()
        self.assertNotEqual(self.superuser.first_name, "Hacked")

    def test_editor_cannot_change_someone_elses_password(self):
        self.client.force_authenticate(self.editor)
        res = self.client.patch(
            reverse("users-detail", args=[self.plain.pk]), {"password": "OwnedPass!123"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.plain.refresh_from_db()
        self.assertTrue(self.plain.check_password("StrongPass!123"))

    def test_owner_can_change_own_password(self):
        self.client.force_authenticate(self.editor)
        res = self.client.patch(
            reverse("users-detail", args=[self.editor.pk]), {"password": "MyNewPass!123"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.editor.refresh_from_db()
        self.assertTrue(self.editor.check_password("MyNewPass!123"))

    def test_editor_cannot_delete_superuser(self):
        self.client.force_authenticate(self.editor)
        res = self.client.delete(reverse("users-detail", args=[self.superuser.pk]))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(User.objects.filter(pk=self.superuser.pk).exists())

    def test_superuser_full_control(self):
        self.client.force_authenticate(self.superuser)
        res = self.client.post(
            reverse("users-list"),
            {"email": _unique("byroot"), "password": "RootMade!123", "is_staff": True},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(pk=res.data["id"])
        self.assertTrue(created.is_staff)
        self.assertTrue(created.check_password("RootMade!123"))
