import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization
from buyers.models import Buyer
from merchandising.models import Style
from costing.models import PreCosting, CostSheet

print("Seeding costing data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

buyer, _ = Buyer.objects.get_or_create(organization=org, code="HM", defaults={"name": "H&M Group", "country": "Sweden"})

styles = []
for name, snum in [
    ("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"), ("Denim Jacket", "STY-003"),
    ("Chino Pants", "STY-004"), ("Hoodie", "STY-005"), ("Track Pants", "STY-006"),
]:
    s, _ = Style.objects.get_or_create(organization=org, style_number=snum, defaults={"name": name, "buyer": buyer})
    styles.append(s)

# ── Pre Costings ────────────────────────────────────────────────────────────
for i, (fab, acc, trim, lab, ovh, tgt, mrg, st) in enumerate([
    (3.20, 0.85, 0.45, 1.60, 0.75, 10.50, 34.76, "approved"),
    (4.10, 1.20, 0.60, 2.10, 0.95, 13.20, 32.20, "approved"),
    (5.60, 1.80, 0.90, 2.60, 1.20, 16.50, 26.67, "revised"),
    (3.80, 0.95, 0.50, 1.80, 0.80, 11.80, 33.47, "approved"),
    (4.50, 1.40, 0.70, 2.20, 1.00, 14.90, 34.23, "draft"),
    (2.90, 0.70, 0.40, 1.40, 0.65, 9.80, 38.27, "approved"),
]):
    total = Decimal(str(round(fab + acc + trim + lab + ovh, 2)))
    PreCosting.objects.get_or_create(
        organization=org, buyer=buyer, style=styles[i],
        defaults={"cost_date": date(2024, 8, 10) + timedelta(days=i * 5),
                  "estimated_fabric_cost": Decimal(str(fab)), "estimated_accessory_cost": Decimal(str(acc)),
                  "estimated_trim_cost": Decimal(str(trim)), "estimated_labor_cost": Decimal(str(lab)),
                  "estimated_overhead": Decimal(str(ovh)), "total_estimated_cost": total,
                  "target_price": Decimal(str(tgt)), "expected_margin": Decimal(str(mrg)),
                  "status": st, "notes": "Pre-costing for buyer quotation"},
    )

# ── Cost Sheets ─────────────────────────────────────────────────────────────
for i, (fab, acc, trim, lab, ovh, com, sell, mrg, st) in enumerate([
    (3.15, 0.90, 0.42, 1.55, 0.70, 0.35, 10.50, 32.67, "final"),
    (4.05, 1.25, 0.58, 2.05, 0.90, 0.40, 13.20, 30.08, "final"),
    (5.55, 1.85, 0.88, 2.55, 1.15, 0.50, 16.50, 24.36, "revised"),
    (3.75, 1.00, 0.48, 1.75, 0.75, 0.35, 11.80, 31.53, "final"),
    (4.45, 1.45, 0.68, 2.15, 0.95, 0.45, 14.90, 32.01, "draft"),
    (2.85, 0.75, 0.38, 1.35, 0.60, 0.30, 9.80, 36.43, "final"),
]):
    total = Decimal(str(round(fab + acc + trim + lab + ovh + com, 2)))
    CostSheet.objects.get_or_create(
        organization=org, style=styles[i], cost_date=date(2024, 9, 10) + timedelta(days=i * 5),
        defaults={"fabric_cost": Decimal(str(fab)), "accessory_cost": Decimal(str(acc)),
                  "trim_cost": Decimal(str(trim)), "labor_cost": Decimal(str(lab)),
                  "overhead_cost": Decimal(str(ovh)), "commercial_cost": Decimal(str(com)),
                  "total_cost": total, "selling_price": Decimal(str(sell)), "margin": Decimal(str(mrg)),
                  "status": st, "notes": "Final cost sheet for production"},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [(PreCosting, "Pre Costings"), (CostSheet, "Cost Sheets")]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
