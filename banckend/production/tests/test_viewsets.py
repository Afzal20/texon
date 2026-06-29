from decimal import Decimal

from django.contrib.auth.models import Group
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from production.models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    OEELog,
    ProductionRecord,
)

from .factories import (
    BottleneckAlertFactory,
    LineCapacityFactory,
    OEELogFactory,
    OrganizationFactory,
    ProductionLineFactory,
    ProductionShiftFactory,
    ProductionUnitFactory,
    UserFactory,
)


class _AuthenticatedTestCase(TestCase):
    """Base class that sets up an authenticated user with an org."""

    def setUp(self):
        self.org = OrganizationFactory()
        self.user = UserFactory(organization=self.org)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)


# ──────────────────────────────────────────────
# ProductionUnit CRUD
# ──────────────────────────────────────────────


class ProductionUnitCRUDTest(_AuthenticatedTestCase):
    def test_list(self):
        ProductionUnitFactory(organization=self.org)
        ProductionUnitFactory(organization=self.org)
        resp = self.client.get("/api/production/units/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 2)

    def test_create(self):
        resp = self.client.post(
            "/api/production/units/",
            {"name": "Unit X", "location": "Dhaka"},
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["organization"], self.org.pk)

    def test_retrieve_detail(self):
        unit = ProductionUnitFactory(organization=self.org)
        resp = self.client.get(f"/api/production/units/{unit.pk}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["name"], unit.name)

    def test_update(self):
        unit = ProductionUnitFactory(organization=self.org)
        resp = self.client.patch(
            f"/api/production/units/{unit.pk}/",
            {"name": "Renamed Unit"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        unit.refresh_from_db()
        self.assertEqual(unit.name, "Renamed Unit")

    def test_delete(self):
        unit = ProductionUnitFactory(organization=self.org)
        resp = self.client.delete(f"/api/production/units/{unit.pk}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_org_isolation(self):
        """Units from another org should not appear."""
        other_org = OrganizationFactory()
        ProductionUnitFactory(organization=other_org)
        ProductionUnitFactory(organization=self.org)
        resp = self.client.get("/api/production/units/")
        self.assertEqual(resp.data["count"], 1)


# ──────────────────────────────────────────────
# ProductionLine CRUD
# ──────────────────────────────────────────────


class ProductionLineCRUDTest(_AuthenticatedTestCase):
    def test_list(self):
        unit = ProductionUnitFactory(organization=self.org)
        ProductionLineFactory(production_unit=unit)
        resp = self.client.get("/api/production/lines/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 1)

    def test_filter_is_active(self):
        unit = ProductionUnitFactory(organization=self.org)
        ProductionLineFactory(production_unit=unit, is_active=True)
        ProductionLineFactory(production_unit=unit, is_active=False)
        resp = self.client.get("/api/production/lines/?is_active=true")
        self.assertEqual(resp.data["count"], 1)


# ──────────────────────────────────────────────
# Custom actions on ProductionLine
# ──────────────────────────────────────────────


class RecordOutputTest(_AuthenticatedTestCase):
    def test_record_output_success(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)
        shift = ProductionShiftFactory(organization=self.org)

        resp = self.client.post(
            f"/api/production/lines/{line.pk}/record-output/",
            {
                "shift_id": shift.pk,
                "output_pcs": 4500,
                "timestamp": "2026-06-29T08:00:00Z",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductionRecord.objects.count(), 1)
        self.assertEqual(resp.data["output_pcs"], 4500)

    def test_record_output_invalid_shift(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)

        resp = self.client.post(
            f"/api/production/lines/{line.pk}/record-output/",
            {"shift_id": 99999, "output_pcs": 100, "timestamp": "2026-06-29T08:00:00Z"},
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class RecordOEETest(_AuthenticatedTestCase):
    def test_record_oee_success(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)

        resp = self.client.post(
            f"/api/production/lines/{line.pk}/record-oee/",
            {
                "availability_rate": "90.00",
                "performance_rate": "85.00",
                "quality_rate": "95.00",
                "timestamp": "2026-06-29T08:00:00Z",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(OEELog.objects.count(), 1)
        # 90 * 85 * 95 / 10000 = 72.675 → 72.68
        self.assertAlmostEqual(
            float(OEELog.objects.first().oee_score), 72.68, places=1
        )

    def test_record_oee_rate_out_of_range(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)

        resp = self.client.post(
            f"/api/production/lines/{line.pk}/record-oee/",
            {
                "availability_rate": "105.00",
                "performance_rate": "85.00",
                "quality_rate": "95.00",
                "timestamp": "2026-06-29T08:00:00Z",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ReportDowntimeTest(_AuthenticatedTestCase):
    def test_report_downtime_success(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)

        resp = self.client.post(
            f"/api/production/lines/{line.pk}/report-downtime/",
            {
                "reason": "Motor failure",
                "duration_minutes": 45,
                "started_at": "2026-06-29T06:30:00Z",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DowntimeEvent.objects.count(), 1)


class ReportDefectTest(_AuthenticatedTestCase):
    def test_report_defect_success(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)

        resp = self.client.post(
            f"/api/production/lines/{line.pk}/report-defect/",
            {
                "defect_type": "Broken stitch",
                "quantity": 12,
                "checked_units": 500,
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DefectLog.objects.count(), 1)
        self.assertAlmostEqual(float(resp.data["dhu"]), 2.4, places=1)


class CalculateOEETest(_AuthenticatedTestCase):
    def test_calculate_oee_for_line(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)

        OEELogFactory(
            production_line=line,
            availability_rate=Decimal("90.00"),
            performance_rate=Decimal("85.00"),
            quality_rate=Decimal("95.00"),
            oee_score=Decimal("72.68"),
            timestamp=timezone.now(),
        )
        OEELogFactory(
            production_line=line,
            availability_rate=Decimal("80.00"),
            performance_rate=Decimal("80.00"),
            quality_rate=Decimal("90.00"),
            oee_score=Decimal("57.60"),
            timestamp=timezone.now(),
        )

        resp = self.client.get(
            f"/api/production/lines/{line.pk}/calculate-oee/",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["records_count"], 2)
        self.assertIsNotNone(resp.data["avg_oee"])


# ──────────────────────────────────────────────
# BottleneckAlert resolve
# ──────────────────────────────────────────────


class ResolveBottleneckTest(_AuthenticatedTestCase):
    def test_resolve_success(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)
        alert = BottleneckAlertFactory(production_line=line)

        resp = self.client.post(
            f"/api/production/alerts/{alert.pk}/resolve/",
            {"resolved_at": "2026-06-29T12:00:00Z"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertTrue(alert.is_resolved)

    def test_resolve_already_resolved(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)
        alert = BottleneckAlertFactory(
            production_line=line, is_resolved=True, resolved_at=timezone.now()
        )

        resp = self.client.post(
            f"/api/production/alerts/{alert.pk}/resolve/",
            {"resolved_at": "2026-06-29T12:00:00Z"},
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────
# Bulk create
# ──────────────────────────────────────────────


class BulkCreateTest(_AuthenticatedTestCase):
    def test_bulk_create_success(self):
        unit = ProductionUnitFactory(organization=self.org)
        line = ProductionLineFactory(production_unit=unit)
        shift = ProductionShiftFactory(organization=self.org)

        resp = self.client.post(
            "/api/production/records/bulk-create/",
            {
                "records": [
                    {
                        "production_line": line.pk,
                        "shift": shift.pk,
                        "output_pcs": 4500,
                        "timestamp": "2026-06-29T08:00:00Z",
                    },
                    {
                        "production_line": line.pk,
                        "shift": shift.pk,
                        "output_pcs": 3800,
                        "timestamp": "2026-06-29T16:00:00Z",
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductionRecord.objects.count(), 2)


# ──────────────────────────────────────────────
# ProductionShift CRUD
# ──────────────────────────────────────────────


class ProductionShiftCRUDTest(_AuthenticatedTestCase):
    def test_list(self):
        ProductionShiftFactory(organization=self.org)
        resp = self.client.get("/api/production/shifts/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 1)

    def test_create(self):
        resp = self.client.post(
            "/api/production/shifts/",
            {"name": "Night Shift", "start_time": "22:00:00", "end_time": "06:00:00"},
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Unauthenticated access
# ──────────────────────────────────────────────


class UnauthenticatedAccessTest(TestCase):
    def test_unauthenticated_returns_401_or_403(self):
        client = APIClient()
        resp = client.get("/api/production/units/")
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
