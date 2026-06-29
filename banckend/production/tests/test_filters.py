from django.test import TestCase

from production.filters import (
    BottleneckAlertFilter,
    DefectLogFilter,
    ProductionLineFilter,
    ProductionUnitFilter,
)
from production.models import BottleneckAlert, DefectLog, ProductionLine, ProductionUnit
from production.tests.factories import (
    BottleneckAlertFactory,
    DefectLogFactory,
    ProductionLineFactory,
    ProductionUnitFactory,
)


class ProductionUnitFilterTest(TestCase):
    def test_filter_by_name(self):
        u1 = ProductionUnitFactory(name="Dhaka Unit A")
        u2 = ProductionUnitFactory(name="Chittagong Unit")
        f = ProductionUnitFilter(data={"name": "dhaka"}, queryset=ProductionUnit.objects.all())
        self.assertEqual(f.qs.count(), 1)
        self.assertEqual(f.qs.first(), u1)

    def test_filter_by_location(self):
        u1 = ProductionUnitFactory(location="Mirpur")
        u2 = ProductionUnitFactory(location="Gulshan")
        f = ProductionUnitFilter(data={"location": "mirpur"}, queryset=ProductionUnit.objects.all())
        self.assertEqual(f.qs.count(), 1)
        self.assertEqual(f.qs.first(), u1)


class ProductionLineFilterTest(TestCase):
    def test_filter_by_is_active(self):
        l1 = ProductionLineFactory(is_active=True)
        l2 = ProductionLineFactory(is_active=False)
        f = ProductionLineFilter(data={"is_active": True}, queryset=ProductionLine.objects.all())
        self.assertEqual(f.qs.count(), 1)
        self.assertEqual(f.qs.first(), l1)


class DefectLogFilterTest(TestCase):
    def test_filter_by_defect_type(self):
        d1 = DefectLogFactory(defect_type="Broken needle")
        d2 = DefectLogFactory(defect_type="Stain")
        f = DefectLogFilter(data={"defect_type": "needle"}, queryset=DefectLog.objects.all())
        self.assertEqual(f.qs.count(), 1)
        self.assertEqual(f.qs.first(), d1)


class BottleneckAlertFilterTest(TestCase):
    def test_filter_by_is_resolved(self):
        a1 = BottleneckAlertFactory(is_resolved=True)
        a2 = BottleneckAlertFactory(is_resolved=False)
        f = BottleneckAlertFilter(data={"is_resolved": False}, queryset=BottleneckAlert.objects.all())
        self.assertEqual(f.qs.count(), 1)
        self.assertEqual(f.qs.first(), a2)
