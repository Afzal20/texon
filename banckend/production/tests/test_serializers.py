from datetime import time
from decimal import Decimal

from django.test import TestCase

from production.serializers import (
    DefectLogSerializer,
    DowntimeEventSerializer,
    OEELogSerializer,
    ProductionRecordDetailSerializer,
    ProductionUnitListSerializer,
    RecordOutputSerializer,
)

from .factories import (
    DefectLogFactory,
    DowntimeEventFactory,
    LineCapacityFactory,
    OEELogFactory,
    ProductionLineFactory,
    ProductionRecordFactory,
    ProductionShiftFactory,
    ProductionUnitFactory,
)


class ProductionUnitListSerializerTest(TestCase):
    """Tests for ProductionUnitListSerializer including annotated lines_count."""

    def test_lines_count_annotation(self):
        unit = ProductionUnitFactory()
        ProductionLineFactory(production_unit=unit)
        ProductionLineFactory(production_unit=unit)

        from production.models import ProductionUnit
        from django.db.models import Count

        qs = ProductionUnit.objects.filter(pk=unit.pk).annotate(lines_count=Count("lines"))
        ser = ProductionUnitListSerializer(qs.first())
        self.assertEqual(ser.data["lines_count"], 2)


class ProductionRecordDetailSerializerTest(TestCase):
    """Tests for computed fields: efficiency_rate, shift_duration."""

    def test_efficiency_rate_with_capacity(self):
        line = ProductionLineFactory()
        LineCapacityFactory(production_line=line, daily_capacity_pcs=5000)
        shift = ProductionShiftFactory(organization=line.production_unit.organization)
        record = ProductionRecordFactory(
            production_line=line, shift=shift, output_pcs=2500
        )
        ser = ProductionRecordDetailSerializer(record)
        self.assertEqual(ser.data["efficiency_rate"], 50.0)

    def test_efficiency_rate_without_capacity(self):
        line = ProductionLineFactory()
        shift = ProductionShiftFactory(organization=line.production_unit.organization)
        record = ProductionRecordFactory(
            production_line=line, shift=shift, output_pcs=2500
        )
        ser = ProductionRecordDetailSerializer(record)
        self.assertIsNone(ser.data["efficiency_rate"])

    def test_shift_duration_normal(self):
        line = ProductionLineFactory()
        shift = ProductionShiftFactory(
            organization=line.production_unit.organization,
            start_time=time(8, 0),
            end_time=time(16, 0),
        )
        record = ProductionRecordFactory(production_line=line, shift=shift)
        ser = ProductionRecordDetailSerializer(record)
        self.assertEqual(ser.data["shift_duration"], 8.0)

    def test_shift_duration_overnight(self):
        line = ProductionLineFactory()
        shift = ProductionShiftFactory(
            organization=line.production_unit.organization,
            start_time=time(22, 0),
            end_time=time(6, 0),
        )
        record = ProductionRecordFactory(production_line=line, shift=shift)
        ser = ProductionRecordDetailSerializer(record)
        self.assertEqual(ser.data["shift_duration"], 8.0)

    def test_negative_output_pcs_rejected(self):
        ser = RecordOutputSerializer(data={
            "shift_id": 1,
            "output_pcs": -10,
            "timestamp": "2026-06-29T08:00:00Z",
        })
        self.assertFalse(ser.is_valid())
        self.assertIn("output_pcs", ser.errors)


class OEELogSerializerTest(TestCase):
    """Tests for OEE score computation and rate validation."""

    def test_oee_score_computation(self):
        log = OEELogFactory(
            availability_rate=Decimal("90.00"),
            performance_rate=Decimal("85.00"),
            quality_rate=Decimal("95.00"),
        )
        # Manually set oee_score to something else to test serializer computes it
        log.oee_score = Decimal("0.00")
        ser = OEELogSerializer(log)
        # 90 * 85 * 95 / 10000 = 72.675
        self.assertAlmostEqual(ser.data["oee_score"], 72.68, places=2)

    def test_rate_above_100_rejected(self):
        ser = OEELogSerializer(
            data={
                "production_line": 1,
                "availability_rate": "110.00",
                "performance_rate": "85.00",
                "quality_rate": "95.00",
                "timestamp": "2026-06-29T08:00:00Z",
            }
        )
        self.assertFalse(ser.is_valid())
        self.assertIn("availability_rate", ser.errors)

    def test_rate_below_0_rejected(self):
        ser = OEELogSerializer(
            data={
                "production_line": 1,
                "availability_rate": "-5.00",
                "performance_rate": "85.00",
                "quality_rate": "95.00",
                "timestamp": "2026-06-29T08:00:00Z",
            }
        )
        self.assertFalse(ser.is_valid())
        self.assertIn("availability_rate", ser.errors)


class DowntimeEventSerializerTest(TestCase):
    """Tests for downtime_hours computation and cross-field validation."""

    def test_downtime_hours(self):
        event = DowntimeEventFactory(duration_minutes=90)
        ser = DowntimeEventSerializer(event)
        self.assertEqual(ser.data["downtime_hours"], 1.5)

    def test_resolved_before_started_rejected(self):
        line = ProductionLineFactory()
        ser = DowntimeEventSerializer(
            data={
                "production_line": line.pk,
                "reason": "Test",
                "duration_minutes": 30,
                "started_at": "2026-06-29T10:00:00Z",
                "resolved_at": "2026-06-29T09:00:00Z",
            }
        )
        self.assertFalse(ser.is_valid())
        self.assertIn("resolved_at", ser.errors)


class DefectLogSerializerTest(TestCase):
    """Tests for DHU computation and checked_units validation."""

    def test_dhu_computation(self):
        defect = DefectLogFactory(quantity=12, checked_units=500)
        ser = DefectLogSerializer(defect)
        self.assertEqual(ser.data["dhu"], 2.4)

    def test_dhu_zero_checked_units(self):
        defect = DefectLogFactory(quantity=5, checked_units=1)
        # Hack: set checked_units to 0 at the object level to test the guard
        defect.checked_units = 0
        ser = DefectLogSerializer(defect)
        self.assertEqual(ser.data["dhu"], 0.0)

    def test_checked_units_must_be_positive(self):
        line = ProductionLineFactory()
        ser = DefectLogSerializer(
            data={
                "production_line": line.pk,
                "defect_type": "Test",
                "quantity": 5,
                "checked_units": 0,
                "timestamp": "2026-06-29T08:00:00Z",
            }
        )
        self.assertFalse(ser.is_valid())
        self.assertIn("checked_units", ser.errors)
