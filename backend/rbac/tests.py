"""Security regression tests for the RBAC management API.

The former GraphQL gateway exposed Role/Permission/UserRole mutations to any
authenticated user (privilege escalation). These tests pin down the REST
replacement: reads stay open to authenticated users, every write requires the
``roles.manage`` codename, superusers bypass, system roles cannot be deleted,
and role permissions actually gate other API endpoints (e.g. ``users.view``).
"""

from uuid import uuid4

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Permission, Role, RolePermission, UserRole

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
    """Attach a fresh role holding exactly ``codenames`` to ``user``."""
    role = Role.objects.create(name=f"role-{uuid4().hex[:10]}")
    for codename in codenames:
        perm, _ = Permission.objects.get_or_create(
            codename=codename, defaults={"label": codename, "group": "test"}
        )
        RolePermission.objects.get_or_create(role=role, permission=perm)
    UserRole.objects.create(user=user, role=role)
    return role


class RbacAccessTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.superuser = make_user(_unique("super"), is_superuser=True, is_staff=True)
        self.plain = make_user(_unique("plain"))
        self.manager = make_user(_unique("manager"), is_staff=True)
        grant_roles(self.manager, "roles.manage")

    def test_anonymous_cannot_read(self):
        res = self.client.get(reverse("roles-list"))
        self.assertIn(res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_plain_user_can_read_but_not_write(self):
        self.client.force_authenticate(self.plain)
        self.assertEqual(self.client.get(reverse("roles-list")).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(reverse("permissions-list")).status_code, status.HTTP_200_OK)

        res = self.client.post(reverse("roles-list"), {"name": "Sneaky"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Role.objects.filter(name="Sneaky").exists())

    def test_plain_user_cannot_assign_roles(self):
        target = make_user(_unique("victim"))
        victim_role = Role.objects.create(name="victim-role")
        self.client.force_authenticate(self.plain)

        res = self.client.post(
            reverse("user-roles-list"),
            {"user": target.pk, "role": victim_role.pk},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(UserRole.objects.filter(user=target).exists())

    def test_roles_manage_holder_writes(self):
        self.client.force_authenticate(self.manager)
        res = self.client.post(
            reverse("roles-list"), {"name": "Auditor", "description": "d"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        role = Role.objects.get(name="Auditor")

        target = make_user(_unique("assignee"))
        res = self.client.post(
            reverse("user-roles-list"), {"user": target.pk, "role": role.pk}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserRole.objects.filter(user=target, role=role).exists())

    def test_system_role_protected_from_deletion(self):
        system_role = Role.objects.create(name=f"sys-{uuid4().hex[:8]}", is_system=True)
        self.client.force_authenticate(self.superuser)
        res = self.client.delete(reverse("roles-detail", args=[system_role.pk]))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Role.objects.filter(pk=system_role.pk).exists())

    def test_superuser_bypasses_manage_perm(self):
        self.client.force_authenticate(self.superuser)
        res = self.client.post(reverse("roles-list"), {"name": "RootMade"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)


class BulkAssignTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = make_user(_unique("manager"), is_staff=True)
        grant_roles(self.manager, "roles.manage")
        self.target = make_user(_unique("target"))

    def test_bulk_assign_multiple_roles(self):
        r1 = Role.objects.create(name=f"r1-{uuid4().hex[:6]}")
        r2 = Role.objects.create(name=f"r2-{uuid4().hex[:6]}")
        self.client.force_authenticate(self.manager)
        res = self.client.post(
            reverse("user-roles-bulk-assign"),
            {"user": self.target.pk, "roles": [r1.pk, r2.pk]},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(UserRole.objects.filter(user=self.target).count(), 2)

    def test_bulk_assign_is_idempotent(self):
        role = Role.objects.create(name=f"r-{uuid4().hex[:6]}")
        self.client.force_authenticate(self.manager)
        payload = {"user": self.target.pk, "roles": [role.pk]}
        self.client.post(reverse("user-roles-bulk-assign"), payload, format="json")
        res = self.client.post(reverse("user-roles-bulk-assign"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(UserRole.objects.filter(user=self.target, role=role).count(), 1)

    def test_bulk_assign_rejects_bad_payload_and_unknown_roles(self):
        self.client.force_authenticate(self.manager)
        res = self.client.post(
            reverse("user-roles-bulk-assign"), {"user": self.target.pk}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        res = self.client.post(
            reverse("user-roles-bulk-assign"),
            {"user": self.target.pk, "roles": [999999]},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bulk_assign_requires_manage_perm(self):
        self.client.force_authenticate(make_user(_unique("plain")))
        role = Role.objects.create(name=f"r-{uuid4().hex[:6]}")
        res = self.client.post(
            reverse("user-roles-bulk-assign"),
            {"user": self.target.pk, "roles": [role.pk]},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(UserRole.objects.filter(user=self.target).exists())


class MyPermissionsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def test_anonymous_denied(self):
        res = self.client.get(reverse("my-permissions"))
        self.assertIn(res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_returns_own_roles_and_permissions_only(self):
        user = make_user(_unique("viewer"))
        mine = grant_roles(user, "orders.view", "buyers.view")
        other = grant_roles(make_user(_unique("other")), "users.delete")

        self.client.force_authenticate(user)
        res = self.client.get(reverse("my-permissions"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertFalse(data["is_superuser"])
        self.assertEqual([r["id"] for r in data["roles"]], [mine.id])
        self.assertNotIn(other.id, [r["id"] for r in data["roles"]])
        self.assertEqual(sorted(data["permissions"]), ["buyers.view", "orders.view"])
        self.assertNotIn("users.delete", data["permissions"])

    def test_superuser_gets_every_permission(self):
        Permission.objects.get_or_create(
            codename="some.perm", defaults={"label": "x", "group": "t"}
        )
        self.client.force_authenticate(
            make_user(_unique("root"), is_superuser=True, is_staff=True)
        )
        res = self.client.get(reverse("my-permissions"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["is_superuser"])
        self.assertIn("some.perm", data["permissions"])


class EndpointEnforcementTests(APITestCase):
    """Role permissions must actually gate non-RBAC API endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_users_endpoint_gated_by_rbac_permission(self):
        viewer = make_user(_unique("viewer"))
        grant_roles(viewer, "users.view")
        outsider = make_user(_unique("outsider"))

        # Without the codename -> forbidden.
        self.client.force_authenticate(outsider)
        res = self.client.get("/api/v1/users/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # With the codename (via role) -> allowed.
        self.client.force_authenticate(viewer)
        res = self.client.get("/api/v1/users/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_revoking_role_revokes_access_immediately(self):
        user = make_user(_unique("temp"))
        role = grant_roles(user, "users.view")

        self.client.force_authenticate(user)
        self.assertEqual(self.client.get("/api/v1/users/").status_code, status.HTTP_200_OK)

        role.delete()
        # Simulate a brand-new request: JWT auth reloads the user from the DB,
        # so the per-request permission cache on the old instance doesn't apply.
        self.client.force_authenticate(User.objects.get(pk=user.pk))
        self.assertEqual(self.client.get("/api/v1/users/").status_code, status.HTTP_403_FORBIDDEN)
