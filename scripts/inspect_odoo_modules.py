"""Inspect Odoo addon source without connecting to or modifying a database.

Run inside the selected Odoo container with each configured addon root. Source
availability is distinct from database installation and workflow verification.
"""

import argparse
import ast
import hashlib
import json
from pathlib import Path
import re

DEFAULT_MODULES = (
    "sale", "crm", "purchase", "stock", "mrp", "mrp_subcontracting",
    "account", "portal", "website", "project", "hr_timesheet", "calendar",
    "mass_mailing", "hr", "hr_holidays", "hr_attendance", "hr_contract",
    "hr_appraisal", "knowledge", "sign", "helpdesk", "helpdesk_mgmt",
)


def inspect_modules(roots, names):
    roots = [Path(root) for root in roots]
    result = {}
    for name in names:
        if not re.fullmatch(r"[a-z][a-z0-9_]*", name):
            raise ValueError(f"Invalid technical module name: {name!r}")
        matches = [root / name / "__manifest__.py" for root in roots]
        path = next((path for path in matches if path.is_file()), None)
        if path is None:
            result[name] = {"status": "missing"}
            continue
        source = path.read_bytes()
        try:
            manifest = ast.literal_eval(source.decode("utf-8"))
            if not isinstance(manifest, dict):
                raise ValueError("Manifest must be a dictionary")
            dependencies = manifest.get("depends", [])
            if not isinstance(dependencies, list) or not all(
                isinstance(dep, str) and re.fullmatch(r"[a-z][a-z0-9_]*", dep)
                for dep in dependencies
            ):
                raise ValueError("Invalid dependency names")
        except (SyntaxError, ValueError, TypeError, UnicodeError):
            result[name] = {"status": "invalid_manifest", "path": str(path)}
            continue
        result[name] = {
            "status": "source_present",
            "path": str(path),
            "manifest_sha256": hashlib.sha256(source).hexdigest(),
            "manifest_version": manifest.get("version"),
            "license": manifest.get("license"),
            "installable": manifest.get("installable", True),
            "depends": dependencies,
            "missing_dependency_sources": [
                dep for dep in dependencies
                if not any((root / dep / "__manifest__.py").is_file() for root in roots)
            ],
        }
    return {"verification": "source_only", "modules": result}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--addons-path", action="append", required=True)
    parser.add_argument("--module", action="append")
    args = parser.parse_args()
    roots = [Path(root) for root in args.addons_path]
    if not all(root.is_dir() for root in roots):
        parser.error("Every addon path must be an existing directory")
    try:
        report = inspect_modules(roots, args.module or DEFAULT_MODULES)
    except ValueError as exc:
        parser.error(str(exc))
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
