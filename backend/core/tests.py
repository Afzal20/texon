"""Regression coverage for the generic ERP gateway's permission boundary."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.urls import reverse
from django.db import OperationalError
from django.test import SimpleTestCase, TestCase
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.test import APITestCase

from buyers.models import Buyer
from core.permissions import StrictModelPermissions


class ModelReadPermissionTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.buyer = Buyer.objects.create(name="Pilot buyer", code="PILOT", country="BD")
        cls.user = get_user_model().objects.create_user(email="reader@example.test", password=None)
        cls.staff = get_user_model().objects.create_user(
            email="staff@example.test", password=None, is_staff=True,
        )

    def grant(self, user, codename):
        user.user_permissions.add(Permission.objects.get(
            content_type__app_label="buyers", content_type__model="buyer", codename=codename,
        ))

    def test_anonymous_cannot_read(self):
        self.assertEqual(self.client.get(reverse("buyers-list")).status_code, 401)

    def test_unprivileged_user_cannot_read_lists_details_or_metadata(self):
        self.client.force_authenticate(self.user)
        for url in (reverse("buyers-list"), reverse("buyers-detail", args=[self.buyer.pk])):
            for method in ("get", "head", "options"):
                with self.subTest(url=url, method=method):
                    self.assertEqual(getattr(self.client, method)(url).status_code, 403)

    def test_staff_status_does_not_grant_model_read_permission(self):
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get(reverse("buyers-list")).status_code, 403)

    def test_change_permission_does_not_grant_read_permission(self):
        self.grant(self.user, "change_buyer")
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(reverse("buyers-list")).status_code, 403)

    def test_view_permission_allows_list_detail_head_and_metadata(self):
        self.grant(self.user, "view_buyer")
        self.client.force_authenticate(self.user)
        result = self.client.get(reverse("buyers-list"))
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["count"], 1)
        url = reverse("buyers-detail", args=[self.buyer.pk])
        self.assertEqual(self.client.get(url).data["code"], "PILOT")
        self.assertEqual(self.client.head(url).status_code, 200)
        self.assertEqual(self.client.options(url).status_code, 200)

    def test_view_permission_does_not_allow_writes(self):
        self.grant(self.user, "view_buyer")
        self.client.force_authenticate(self.user)
        url = reverse("buyers-detail", args=[self.buyer.pk])
        self.assertEqual(self.client.patch(url, {"name": "Changed"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(url).status_code, 403)
        self.buyer.refresh_from_db()
        self.assertEqual(self.buyer.name, "Pilot buyer")

    def test_unsafe_permissions_and_drf_defaults_are_preserved(self):
        permission = StrictModelPermissions()
        for method, expected in (("POST", "add_buyer"), ("PUT", "change_buyer"),
                                 ("PATCH", "change_buyer"), ("DELETE", "delete_buyer")):
            self.assertEqual(permission.get_required_permissions(method, Buyer), [f"buyers.{expected}"])
        self.assertEqual(DjangoModelPermissions.perms_map["GET"], [])


class LivenessTests(SimpleTestCase):
    def test_process_probe_does_not_require_database_or_authentication(self):
        result = self.client.get(reverse("health-live"))
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json(), {"status": "ok"})
        self.assertEqual(result["Cache-Control"], "no-store")

    def test_process_probe_supports_head_and_rejects_writes(self):
        self.assertEqual(self.client.head(reverse("health-live")).status_code, 200)
        self.assertEqual(self.client.post(reverse("health-live")).status_code, 405)


class ReadinessTests(TestCase):
    def test_database_probe_succeeds_against_real_test_database(self):
        result = self.client.get(reverse("health-ready"))
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json(), {"status": "ok"})
        self.assertEqual(result["Cache-Control"], "no-store")

    def test_database_outage_returns_uncached_failure_without_details(self):
        with patch("core.health.connection.cursor", side_effect=OperationalError("private database address")):
            result = self.client.get(reverse("health-ready"))
        self.assertEqual(result.status_code, 503)
        self.assertEqual(result.json(), {"status": "unavailable"})
        self.assertNotIn("private", result.content.decode())
        self.assertEqual(result["Cache-Control"], "no-store")

    def test_unexpected_probe_result_is_not_ready(self):
        with patch("core.health.connection.cursor") as cursor:
            cursor.return_value.__enter__.return_value.fetchone.return_value = None
            result = self.client.get(reverse("health-ready"))
        self.assertEqual(result.status_code, 503)

    def test_database_probe_rejects_writes(self):
        self.assertEqual(self.client.post(reverse("health-ready")).status_code, 405)
