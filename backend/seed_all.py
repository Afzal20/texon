#!/usr/bin/env python
"""
Seed the database with realistic test data for every model, app by app.

Each app has its own seed.py (e.g. commercial/seed.py) following the same
style. This script runs them in dependency order and prints a final summary
of record counts per model.

Usage:
    python seed_all.py
"""
import os
import sys
import runpy

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import django
django.setup()

from django.apps import apps

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

APP_ORDER = [
    "core",
    "authentication",
    "rbac",
    "buyers",
    "hr",
    "inventory",
    "procurement",
    "merchandising",
    "orders",
    "commercial",
    "production",
    "quality",
    "scheduling",
    "performance",
    "compliance",
    "subcontract",
    "tna",
    "ie_planning",
    "costing",
    "planning",
    "crm",
    "fixed_assets",
    "reporting",
    "accounts",
    "ai",
]

for app in APP_ORDER:
    path = os.path.join(BASE_DIR, app, "seed.py")
    if not os.path.exists(path):
        print(f"SKIP: no seed.py in {app}/")
        continue
    print(f"── Running {app}/seed.py ──")
    runpy.run_path(path, run_name="__main__")

print("\nRecord counts per model:")
skip = {"admin", "auth", "contenttypes", "sessions", "token_blacklist"}
for model in sorted(apps.get_models(), key=lambda m: (m._meta.app_label, m.__name__)):
    if model._meta.app_label in skip:
        continue
    count = model.objects.count()
    marker = "  <-- EMPTY" if count == 0 else ""
    print(f"  {model._meta.app_label:15s} {model.__name__:25s} {count}{marker}")

empty = [
    f"{m._meta.app_label}.{m.__name__}"
    for m in apps.get_models()
    if m._meta.app_label not in skip and m.objects.count() == 0
]
if empty:
    print(f"\nWARNING: models with no data: {', '.join(empty)}")
else:
    print("\nAll models have data.")
print("Done!")
