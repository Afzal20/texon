import factory
from django.utils import timezone

from production.models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    HeatmapData,
    LineCapacity,
    OEELog,
    ProductionLine,
    ProductionRecord,
    ProductionShift,
    ProductionUnit,
)
from users.models import CustomUser, Organization


class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Organization

    name = factory.Sequence(lambda n: f"Org {n}")
    code = factory.Sequence(lambda n: f"ORG-{n:04d}")


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomUser

    email = factory.LazyAttribute(lambda o: f"{o.first_name.lower()}@example.com")
    first_name = factory.Faker("first_name")
    organization = factory.SubFactory(OrganizationFactory)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "testpass123!")
        user = model_class(**kwargs)
        user.set_password(password)
        user.save()
        return user


class ProductionUnitFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductionUnit

    organization = factory.SubFactory(OrganizationFactory)
    name = factory.Sequence(lambda n: f"Unit {n}")
    location = factory.Faker("city")


class ProductionLineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductionLine

    production_unit = factory.SubFactory(ProductionUnitFactory)
    name = factory.Sequence(lambda n: f"Line S{n}")
    is_active = True


class LineCapacityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LineCapacity

    production_line = factory.SubFactory(ProductionLineFactory)
    daily_capacity_pcs = 5000


class ProductionShiftFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductionShift

    organization = factory.SubFactory(OrganizationFactory)
    name = factory.Sequence(lambda n: f"Shift {n}")
    start_time = factory.LazyFunction(lambda: timezone.now().time())
    end_time = factory.LazyFunction(
        lambda: (timezone.now() + timezone.timedelta(hours=8)).time()
    )


class ProductionRecordFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductionRecord

    production_line = factory.SubFactory(ProductionLineFactory)
    shift = factory.SubFactory(ProductionShiftFactory)
    output_pcs = factory.Faker("random_int", min=100, max=5000)
    timestamp = factory.LazyFunction(timezone.now)


class OEELogFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OEELog

    production_line = factory.SubFactory(ProductionLineFactory)
    availability_rate = factory.Faker("pydecimal", left_digits=2, right_digits=2, min_value=50, max_value=100)
    performance_rate = factory.Faker("pydecimal", left_digits=2, right_digits=2, min_value=50, max_value=100)
    quality_rate = factory.Faker("pydecimal", left_digits=2, right_digits=2, min_value=50, max_value=100)
    oee_score = factory.LazyAttribute(
        lambda o: round(
            float(o.availability_rate) * float(o.performance_rate) * float(o.quality_rate) / 10_000,
            2,
        )
    )
    timestamp = factory.LazyFunction(timezone.now)


class DowntimeEventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DowntimeEvent

    production_line = factory.SubFactory(ProductionLineFactory)
    reason = factory.Faker("sentence", nb_words=4)
    duration_minutes = factory.Faker("random_int", min=5, max=120)
    started_at = factory.LazyFunction(timezone.now)
    resolved_at = None


class DefectLogFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DefectLog

    production_line = factory.SubFactory(ProductionLineFactory)
    defect_type = factory.Iterator(["Broken stitch", "Skip stitch", "Oil stain", "Misalignment"])
    quantity = factory.Faker("random_int", min=1, max=50)
    checked_units = factory.Faker("random_int", min=100, max=1000)
    timestamp = factory.LazyFunction(timezone.now)


class HeatmapDataFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = HeatmapData

    production_line = factory.SubFactory(ProductionLineFactory)
    activity_score = factory.Faker("random_int", min=0, max=100)
    timestamp = factory.LazyFunction(timezone.now)


class BottleneckAlertFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BottleneckAlert

    production_line = factory.SubFactory(ProductionLineFactory)
    alert_message = factory.Faker("sentence", nb_words=8)
    is_resolved = False
    resolved_at = None
