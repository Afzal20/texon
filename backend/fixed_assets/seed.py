import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization, Location
from fixed_assets.models import AssetCategory, FixedAsset, DepreciationSchedule

print("Seeding fixed_assets data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

locations = []
for name, code in [
    ("Factory Floor 1", "FF1"), ("Factory Floor 2", "FF2"),
]:
    loc, _ = Location.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "address": "Gazipur Industrial Park", "city": "Gazipur", "country": "Bangladesh"},
    )
    locations.append(loc)

# ── Asset Categories ────────────────────────────────────────────────────────
cats = []
for name, code, method, life in [
    ("Industrial Sewing Machine", "ASM", "straight_line", 10),
    ("Overlock Machine", "OLK", "straight_line", 8),
    ("Cutting Machine", "CTM", "straight_line", 8),
    ("Generator", "GEN", "declining", 15),
    ("Vehicles", "VEH", "declining", 5),
    ("Office Equipment", "OFF", "straight_line", 5),
]:
    c, _ = AssetCategory.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "description": f"{name} category for factory", "depreciation_method": method,
                  "useful_life_years": life},
    )
    cats.append(c)

# ── Fixed Assets ────────────────────────────────────────────────────────────
assets = []
for code, name, cat_i, cost, pdate, salvage, st, assigned, loc_i in [
    ("FAS-2401", "Juki DDL-9000", 0, 3200, "2021-03-15", 200, "active", "Operator Kamal", 0),
    ("FAS-2402", "Juki DDL-8700", 0, 2900, "2021-06-20", 200, "active", "Operator Shanta", 0),
    ("FAS-2403", "Brother S-7200B", 0, 3400, "2022-01-10", 200, "active", "Operator Rahim", 0),
    ("FAS-2404", "Juki MO-6714", 1, 2400, "2021-04-05", 150, "active", "Operator Nipa", 0),
    ("FAS-2405", "Juki MO-6816", 1, 2600, "2022-02-18", 150, "under_maintenance", "Maintenance Dept", 0),
    ("FAS-2406", "Kansai Special WX-5503", 1, 3800, "2021-08-12", 200, "active", "Operator Tania", 0),
    ("FAS-2407", "Gerber Cutter DCS-2600", 2, 12500, "2021-05-01", 500, "active", "Cutting Supervisor", 1),
    ("FAS-2408", "KM Blue Clay Cutter", 2, 5200, "2022-03-08", 300, "active", "Cutting Operator", 1),
    ("FAS-2409", "Cummins 250kVA Generator", 3, 85000, "2021-09-15", 5000, "active", "Engineering Dept", 0),
    ("FAS-2410", "Honda 100kVA Generator", 3, 42000, "2023-01-20", 2000, "active", "Engineering Dept", 1),
    ("FAS-2411", "Toyota Hilux Pickup", 4, 28000, "2022-06-10", 3000, "active", "Logistics", None),
    ("FAS-2412", "Tata Truck 8T", 4, 35000, "2021-11-05", 4000, "active", "Logistics", None),
    ("FAS-2413", "Dell OptiPlex Desktop", 5, 1200, "2023-02-15", 100, "active", "Accounts Dept", None),
    ("FAS-2414", "HP LaserJet Printer", 5, 900, "2022-08-20", 50, "active", "Merchandising Dept", None),
    ("FAS-2415", "Mitsubishi Air Conditioner", 5, 1400, "2021-12-10", 100, "active", "Admin Dept", 1),
]:
    category = cats[cat_i]
    purchase_date = date.fromisoformat(pdate)
    elapsed = 2024 - purchase_date.year
    life = category.useful_life_years
    annual_dep = Decimal(str(round((cost - salvage) / life, 2)))
    current = cost - annual_dep * elapsed
    a, _ = FixedAsset.objects.get_or_create(
        organization=org, asset_code=code,
        defaults={"category": category,
                  "location": locations[loc_i] if loc_i is not None else None,
                  "name": name, "description": f"{name} - {category.name}",
                  "purchase_date": purchase_date, "purchase_cost": Decimal(str(cost)),
                  "current_value": current, "salvage_value": Decimal(str(salvage)),
                  "depreciation_amount": annual_dep, "status": st, "assigned_to": assigned,
                  "notes": "Registered in fixed asset register"},
    )
    assets.append(a)

# ── Depreciation Schedules ──────────────────────────────────────────────────
for a in assets:
    purchase_year = a.purchase_date.year
    annual_dep = a.depreciation_amount
    for year in range(purchase_year + 1, 2025):
        opening = a.purchase_cost - annual_dep * (year - purchase_year)
        closing = opening - annual_dep
        DepreciationSchedule.objects.get_or_create(
            fixed_asset=a, period=str(year),
            defaults={"year": year, "opening_value": opening,
                      "depreciation": annual_dep, "closing_value": closing},
        )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [
    (AssetCategory, "Asset Categories"), (FixedAsset, "Fixed Assets"),
    (DepreciationSchedule, "Depreciation Schedules"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
