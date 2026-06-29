from django.contrib.auth.models import Group
from django.test import RequestFactory, TestCase

from production.models import ProductionLine, ProductionRecord
from production.permissions import (
    IsOrganizationMember,
    IsProductionLineAccessible,
    IsProductionManager,
)
from production.tests.factories import (
    OrganizationFactory,
    ProductionLineFactory,
    ProductionRecordFactory,
    UserFactory,
)


class IsOrganizationMemberTest(TestCase):
    def setUp(self):
        self.org1 = OrganizationFactory()
        self.org2 = OrganizationFactory()
        self.user1 = UserFactory(organization=self.org1)
        self.user2 = UserFactory(organization=self.org2)
        self.request_factory = RequestFactory()
        self.permission = IsOrganizationMember()

    def test_has_permission(self):
        request = self.request_factory.get("/")
        request.user = self.user1
        self.assertTrue(self.permission.has_permission(request, None))

    def test_has_permission_no_org(self):
        user_no_org = UserFactory(organization=None)
        request = self.request_factory.get("/")
        request.user = user_no_org
        self.assertFalse(self.permission.has_permission(request, None))

    def test_has_object_permission_direct_fk(self):
        # Using a mock object that mimics a direct organization FK
        class MockObj:
            def __init__(self, org_id):
                self.organization_id = org_id

        request = self.request_factory.get("/")
        request.user = self.user1
        obj = MockObj(self.org1.id)
        self.assertTrue(self.permission.has_object_permission(request, None, obj))
        
        obj_other = MockObj(self.org2.id)
        self.assertFalse(self.permission.has_object_permission(request, None, obj_other))

    def test_has_object_permission_one_hop(self):
        # ProductionLine -> ProductionUnit -> Organization
        line = ProductionLineFactory()
        line.production_unit.organization = self.org1
        line.production_unit.save()

        request = self.request_factory.get("/")
        request.user = self.user1
        self.assertTrue(self.permission.has_object_permission(request, None, line))
        
        request.user = self.user2
        self.assertFalse(self.permission.has_object_permission(request, None, line))

    def test_has_object_permission_two_hops(self):
        # ProductionRecord -> ProductionLine -> ProductionUnit -> Organization
        record = ProductionRecordFactory()
        record.production_line.production_unit.organization = self.org1
        record.production_line.production_unit.save()

        request = self.request_factory.get("/")
        request.user = self.user1
        self.assertTrue(self.permission.has_object_permission(request, None, record))
        
        request.user = self.user2
        self.assertFalse(self.permission.has_object_permission(request, None, record))


class IsProductionManagerTest(TestCase):
    def setUp(self):
        self.user = UserFactory()
        self.manager_group, _ = Group.objects.get_or_create(name="production_manager")
        self.request_factory = RequestFactory()
        self.permission = IsProductionManager()

    def test_is_manager(self):
        self.user.groups.add(self.manager_group)
        request = self.request_factory.get("/")
        request.user = self.user
        self.assertTrue(self.permission.has_permission(request, None))

    def test_is_not_manager(self):
        request = self.request_factory.get("/")
        request.user = self.user
        self.assertFalse(self.permission.has_permission(request, None))


class IsProductionLineAccessibleTest(TestCase):
    def setUp(self):
        self.org1 = OrganizationFactory()
        self.org2 = OrganizationFactory()
        self.user1 = UserFactory(organization=self.org1)
        self.user2 = UserFactory(organization=self.org2)
        self.request_factory = RequestFactory()
        self.permission = IsProductionLineAccessible()

    def test_line_object(self):
        line = ProductionLineFactory()
        line.production_unit.organization = self.org1
        line.production_unit.save()

        request = self.request_factory.get("/")
        request.user = self.user1
        self.assertTrue(self.permission.has_object_permission(request, None, line))

        request.user = self.user2
        self.assertFalse(self.permission.has_object_permission(request, None, line))

    def test_line_related_object(self):
        record = ProductionRecordFactory()
        record.production_line.production_unit.organization = self.org1
        record.production_line.production_unit.save()

        request = self.request_factory.get("/")
        request.user = self.user1
        self.assertTrue(self.permission.has_object_permission(request, None, record))

        request.user = self.user2
        self.assertFalse(self.permission.has_object_permission(request, None, record))
