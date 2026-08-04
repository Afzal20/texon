import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization
from buyers.models import Buyer
from merchandising.models import Style, PurchaseOrder
from planning.models import Plan

print("Seeding planning data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

buyer, _ = Buyer.objects.get_or_create(organization=org, code="HM", defaults={"name": "H&M Group", "country": "Sweden"})

styles = []
for name, snum in [
    ("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"),
    ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"),
]:
    s, _ = Style.objects.get_or_create(organization=org, style_number=snum, defaults={"name": name, "buyer": buyer})
    styles.append(s)

orders = []
for i, (po_num, qty, unit, total, st) in enumerate([
    ("PO-2401", 8200, "4.20", "34440.00", "in_production"),
    ("PO-2402", 5600, "5.80", "32480.00", "in_production"),
    ("PO-2403", 10400, "3.95", "41080.00", "confirmed"),
    ("PO-2404", 7300, "6.40", "46720.00", "confirmed"),
]):
    o, _ = PurchaseOrder.objects.get_or_create(
        organization=org, po_number=po_num,
        defaults={"buyer": buyer, "style": styles[i], "order_date": date(2024, 8, 15) + timedelta(days=i * 10),
                  "delivery_date": date(2024, 10, 25) + timedelta(days=i * 10), "quantity": qty,
                  "unit_price": Decimal(unit), "total_value": Decimal(total), "status": st},
    )
    orders.append(o)

# ── Plans ───────────────────────────────────────────────────────────────────
for ptype, title, sd, ed, details, st, by, style_i, po_i in [
    ("production", "October Production Plan", "2024-10-01", "2024-10-31",
     {"lines": 6, "daily_target": 3600, "total_units": 108000}, "active", "Production Manager", 0, 0),
    ("capacity", "Sewing Floor Capacity Plan", "2024-10-01", "2024-10-31",
     {"lines": 6, "capacity_per_line": 650, "utilization": 92}, "active", "IE Manager", 0, None),
    ("material", "Fabric Procurement Plan - Q4", "2024-10-01", "2024-12-31",
     {"fabric_kg": 185000, "suppliers": 4, "lead_time_days": 21}, "active", "Procurement Manager", 0, 0),
    ("delivery", "October Shipment Plan", "2024-10-01", "2024-10-31",
     {"shipments": 14, "containers": 28, "carriers": 6}, "active", "Commercial Manager", 0, 0),
    ("production", "November Production Plan", "2024-11-01", "2024-11-30",
     {"lines": 6, "daily_target": 3400, "total_units": 95200}, "draft", "Production Manager", 0, 1),
    ("capacity", "Cutting Floor Capacity Plan", "2024-10-01", "2024-10-31",
     {"machines": 8, "daily_cutting": 4500, "efficiency": 88}, "completed", "IE Manager", 0, None),
    ("material", "Accessory Procurement Plan - STY-003", "2024-10-05", "2024-11-15",
     {"zips": 12500, "buttons": 78000, "labels": 26000}, "active", "Procurement Manager", 2, 2),
    ("delivery", "November Shipment Plan", "2024-11-01", "2024-11-30",
     {"shipments": 16, "containers": 32, "carriers": 7}, "draft", "Commercial Manager", 0, None),
    ("production", "December Production Plan", "2024-12-01", "2024-12-31",
     {"lines": 6, "daily_target": 3200, "total_units": 89600}, "draft", "Production Manager", 0, 3),
    ("capacity", "Finishing & Packing Capacity Plan", "2024-10-01", "2024-10-31",
     {"finishing_lines": 4, "packing_lines": 3, "daily_output": 3800}, "completed", "IE Manager", 0, None),
]:
    Plan.objects.get_or_create(
        organization=org, plan_type=ptype, title=title,
        defaults={"style": styles[style_i], "purchase_order": orders[po_i] if po_i is not None else None,
                  "start_date": date.fromisoformat(sd), "end_date": date.fromisoformat(ed),
                  "details": details, "status": st, "created_by": by,
                  "notes": "Plan prepared for production control"},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
print(f"  Plans: {Plan.objects.count()}")
print("Done!")
