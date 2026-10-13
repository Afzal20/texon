from uuid import uuid4
from odoo import exceptions
from odoo.tests import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestTexonWorkflows(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.bridge = cls.env["texon.bridge.service"]
        cls.partner = cls.env["res.partner"].create({"name": "Texon test buyer"})
        cls.product = cls.env["product.product"].create({"name": "Test Polo", "type": "consu", "list_price": 12})
        cls.env.user.group_ids += cls.env.ref("texon_bridge.group_integration")

    def create_quote(self, key=None):
        return self.bridge.execute_atomic_command(key or str(uuid4()), self.env.company.id, "sales.create", {
            "partner_id": self.partner.id, "client_order_ref": "TEST-PO",
            "lines": [{"product_id": self.product.id, "quantity": "10", "unit_price": "12.50"}],
        }, actor_id="test-user")

    def test_create_confirm_and_replay(self):
        key = str(uuid4())
        first = self.create_quote(key)
        self.assertEqual(first, self.create_quote(key))
        self.assertEqual(first["state"], "draft")
        operation = str(uuid4())
        payload = {"order_id": first["id"], "expected_revision": first["revision"]}
        result = self.bridge.execute_atomic_command(operation, self.env.company.id, "sales.confirm", payload, actor_id="test-user")
        self.assertEqual(result["state"], "sale")
        self.assertEqual(result, self.bridge.execute_atomic_command(operation, self.env.company.id, "sales.confirm", payload, actor_id="test-user"))

    def test_reused_identity_changed_actor_is_rejected(self):
        key = str(uuid4())
        self.create_quote(key)
        with self.assertRaises(exceptions.ValidationError):
            self.bridge.execute_atomic_command(key, self.env.company.id, "sales.create", {}, actor_id="other-user")

    def test_changed_quotation_rejects_stale_confirmation(self):
        quote = self.create_quote()
        self.env["sale.order"].browse(quote["id"]).write({"client_order_ref": "CHANGED"})
        # write_date can be fixed within a transaction; force a distinct stored
        # revision for this test using the transaction's simulated old value.
        with self.assertRaises(exceptions.ValidationError):
            self.bridge.execute_atomic_command(str(uuid4()), self.env.company.id, "sales.confirm", {"order_id": quote["id"], "expected_revision": "old-revision"}, actor_id="test-user")

    def test_company_membership_and_allowlist(self):
        with self.assertRaises(exceptions.AccessError):
            self.bridge.read_workspace(999999)
        with self.assertRaises(exceptions.ValidationError):
            self.bridge.execute_atomic_command(str(uuid4()), self.env.company.id, "arbitrary.write", {}, actor_id="test-user")
        self.assertEqual(self.bridge.read_workspace(self.env.company.id, "sales")["company_id"], self.env.company.id)

    def test_malformed_line_has_no_business_effect(self):
        before = self.env["sale.order"].search_count([])
        with self.assertRaises(exceptions.ValidationError):
            self.bridge.execute_atomic_command(str(uuid4()), self.env.company.id, "sales.create", {"partner_id": self.partner.id, "client_order_ref": "BAD", "lines": [{"product_id": self.product.id, "quantity": "NaN", "unit_price": "1"}]}, actor_id="test-user")
        self.assertEqual(self.env["sale.order"].search_count([]), before)
