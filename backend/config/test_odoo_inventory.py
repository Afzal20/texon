"""Test source inspection without importing Odoo or touching its database."""

import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import SimpleTestCase

spec = importlib.util.spec_from_file_location(
    "odoo_inventory", Path(__file__).resolve().parents[2] / "scripts/inspect_odoo_modules.py",
)
inventory = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inventory)


class OdooSourceInventoryTests(SimpleTestCase):
    def write_manifest(self, root, name, value):
        path = Path(root) / name / "__manifest__.py"
        path.parent.mkdir(parents=True)
        path.write_text(value)

    def test_source_evidence_and_missing_dependencies_are_explicit(self):
        with TemporaryDirectory() as root:
            self.write_manifest(root, "sale", "{'license': 'LGPL-3', 'depends': ['base', 'missing_dep']}")
            self.write_manifest(root, "base", "{}")
            report = inventory.inspect_modules([root], ["sale", "sign"])
        self.assertEqual(report["verification"], "source_only")
        sale = report["modules"]["sale"]
        self.assertEqual(sale["status"], "source_present")
        self.assertEqual(sale["missing_dependency_sources"], ["missing_dep"])
        self.assertTrue(sale["installable"])
        self.assertEqual(len(sale["manifest_sha256"]), 64)
        self.assertEqual(report["modules"]["sign"], {"status": "missing"})

    def test_manifest_code_is_never_executed(self):
        with TemporaryDirectory() as root:
            self.write_manifest(root, "bad", "__import__('os').environ.clear()")
            result = inventory.inspect_modules([root], ["bad"])
        self.assertEqual(result["modules"]["bad"]["status"], "invalid_manifest")

    def test_addon_root_order_and_disabled_modules_are_preserved(self):
        with TemporaryDirectory() as first, TemporaryDirectory() as second:
            self.write_manifest(first, "custom", "{'installable': False}")
            self.write_manifest(second, "custom", "{'installable': True}")
            result = inventory.inspect_modules([first, second], ["custom"])
        self.assertFalse(result["modules"]["custom"]["installable"])

    def test_invalid_names_cannot_escape_addon_roots(self):
        for name in ("../private", "/absolute", "bad/name", "", "UPPER"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                inventory.inspect_modules([], [name])

    def test_invalid_dependency_manifest_is_not_reported_available(self):
        with TemporaryDirectory() as root:
            self.write_manifest(root, "custom", "{'depends': ['../private']}")
            result = inventory.inspect_modules([root], ["custom"])
        self.assertEqual(result["modules"]["custom"]["status"], "invalid_manifest")
