from dataclasses import FrozenInstanceError
from datetime import datetime, timedelta, timezone
from decimal import Decimal, localcontext
import json
from uuid import UUID

from django.test import SimpleTestCase

from core.command_fingerprints import canonical_command


class CommandFingerprintTests(SimpleTestCase):
    def command(self, **overrides):
        values = dict(
            tenant_id="pilot", company_id=1, actor_id="user-1",
            command_name="sales.confirm", schema_version=1,
            aggregate_id="order-42", expected_revision=3, parameters={"quantity": 12},
        )
        return canonical_command(**(values | overrides))

    def test_key_order_does_not_change_fingerprint(self):
        left = self.command(parameters={"a": 1, "nested": {"x": 2, "y": 3}})
        right = self.command(parameters={"nested": {"y": 3, "x": 2}, "a": 1})
        self.assertEqual(left, right)

    def test_every_identity_action_and_revision_field_is_bound(self):
        original = self.command()
        alternatives = dict(
            tenant_id="other", company_id=2, actor_id="user-2",
            command_name="sales.cancel", schema_version=2,
            aggregate_id="order-43", expected_revision=4, parameters={"quantity": 13},
        )
        for field, value in alternatives.items():
            with self.subTest(field=field):
                self.assertNotEqual(original.fingerprint, self.command(**{field: value}).fingerprint)

    def test_decimals_are_exact_and_independent_of_decimal_context(self):
        value = Decimal("123456789.123456789000")
        with localcontext() as context:
            context.prec = 3
            result = self.command(parameters={"amount": value, "zero": Decimal("-0.00")})
        self.assertEqual(json.loads(result.payload_json)["parameters"], {"amount": "123456789.123456789", "zero": "0"})
        self.assertEqual(self.command(parameters={"amount": Decimal("1.00")}),
                         self.command(parameters={"amount": Decimal("1.0")}))

    def test_equivalent_timestamp_timezones_are_normalized(self):
        utc = datetime(2026, 10, 13, 12, tzinfo=timezone.utc)
        local = utc.astimezone(timezone(timedelta(hours=6)))
        self.assertEqual(self.command(parameters={"at": utc}), self.command(parameters={"at": local}))

    def test_serialized_snapshot_cannot_be_changed_through_input_mutation(self):
        params = {"items": [{"quantity": 1}]}
        result = self.command(parameters=params)
        params["items"][0]["quantity"] = 99
        self.assertEqual(json.loads(result.payload_json)["parameters"]["items"][0]["quantity"], 1)
        with self.assertRaises(FrozenInstanceError):
            result.payload_json = "changed"

    def test_unsafe_numbers_types_and_naive_dates_are_rejected(self):
        for value in (1.1, float("nan"), Decimal("NaN"), Decimal("Infinity"),
                      Decimal("1e100000"), 2**100, datetime(2026, 1, 1), {1, 2}, b"bytes"):
            with self.subTest(value=repr(value)), self.assertRaises(ValueError):
                self.command(parameters={"value": value})

    def test_context_and_object_types_are_checked(self):
        for overrides in ({"company_id": True}, {"company_id": 0}, {"schema_version": 0},
                          {"expected_revision": -1}, {"actor_id": " "}, {"tenant_id": " pilot"},
                          {"parameters": []}, {"parameters": {1: "value"}}):
            with self.subTest(overrides=overrides), self.assertRaises(ValueError):
                self.command(**overrides)

    def test_depth_size_cycles_and_invalid_unicode_are_bounded(self):
        cyclic = []
        cyclic.append(cyclic)
        for value in (cyclic, "x" * 262145, "\ud800", [None] * 10001):
            with self.subTest(kind=type(value).__name__), self.assertRaises(ValueError):
                self.command(parameters={"value": value})

    def test_uuid_values_and_explicit_create_revision_are_supported(self):
        ref = UUID("f81d4fae-7dec-11d0-a765-00a0c91e6bf6")
        result = self.command(parameters={"reference": ref}, expected_revision=None)
        body = json.loads(result.payload_json)
        self.assertEqual(body["parameters"]["reference"], str(ref))
        self.assertIsNone(body["expected_revision"])
        self.assertEqual(body["fingerprint_format"], 1)
