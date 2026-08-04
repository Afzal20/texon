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
from production.models import ProductionLine, ProductionOrder
from scheduling.models import Schedule

print("Seeding scheduling data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
    ("Nike Inc.", "NKE", "USA"), ("Adidas AG", "ADI", "Germany"),
]:
    b, _ = Buyer.objects.get_or_create(organization=org, code=code, defaults={"name": name, "country": country})
    buyers.append(b)

styles = []
for name, snum in [("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"), ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"), ("Hoodie", "STY-005"), ("Track Pants", "STY-006")]:
    s, _ = Style.objects.get_or_create(organization=org, style_number=snum, defaults={"name": name, "buyer": buyers[0]})
    styles.append(s)

pos = []
for po_num, buyer_i, style_i, qty, price in [
    ("PO-2401", 0, 0, 12000, "4.50"), ("PO-2402", 1, 1, 18500, "6.75"),
    ("PO-2403", 2, 2, 9500, "12.25"), ("PO-2404", 3, 3, 14200, "8.90"),
    ("PO-2405", 4, 4, 22000, "5.60"), ("PO-2406", 5, 5, 16800, "7.20"),
]:
    po, _ = PurchaseOrder.objects.get_or_create(
        organization=org, po_number=po_num,
        defaults={"buyer": buyers[buyer_i], "style": styles[style_i],
                  "order_date": date(2024, 9, 10 + buyer_i), "delivery_date": date(2024, 12, 1),
                  "quantity": qty, "unit_price": Decimal(price),
                  "total_value": Decimal(str(round(qty * Decimal(price), 2))), "status": "in_production"},
    )
    pos.append(po)

lines = []
for name, code, loc, cap in [
    ("Line 1", "LN-01", "Unit 1, Ashulia", 500), ("Line 2", "LN-02", "Unit 1, Ashulia", 600),
    ("Line 3", "LN-03", "Unit 2, Gazipur", 800), ("Line 4", "LN-04", "Unit 2, Gazipur", 900),
    ("Line 5", "LN-05", "Unit 3, Savar", 1000), ("Line 6", "LN-06", "Unit 3, Savar", 1200),
]:
    ln, _ = ProductionLine.objects.get_or_create(organization=org, code=code, defaults={"name": name, "location": loc, "capacity": cap})
    lines.append(ln)

prod_orders = []
for mo_num, po_i, style_i, line_i, qty, start, end, status in [
    ("MO-2401", 0, 0, 0, 12000, "2024-10-01", "2024-10-25", "completed"),
    ("MO-2402", 1, 1, 1, 18500, "2024-10-03", "2024-11-02", "in_progress"),
    ("MO-2403", 2, 2, 2, 9500, "2024-10-05", "2024-10-28", "in_progress"),
    ("MO-2404", 3, 3, 3, 14200, "2024-10-07", "2024-11-10", "released"),
    ("MO-2405", 4, 4, 4, 22000, "2024-10-10", "2024-11-20", "in_progress"),
    ("MO-2406", 5, 5, 5, 16800, "2024-10-12", "2024-11-22", "released"),
    ("MO-2407", 0, 0, 2, 6000, "2024-10-15", "2024-10-30", "on_hold"),
]:
    mo, _ = ProductionOrder.objects.get_or_create(
        organization=org, order_number=mo_num,
        defaults={"purchase_order": pos[po_i], "style": styles[style_i], "production_line": lines[line_i],
                  "quantity": qty, "start_date": date.fromisoformat(start), "end_date": date.fromisoformat(end),
                  "status": status},
    )
    prod_orders.append(mo)

# ── Schedules ────────────────────────────────────────────────────────────────
for mo_i, line_i, sched_date, start, end, target, status, notes in [
    (0, 0, "2024-10-14", "08:00", "20:00", 900, "completed", ""),
    (1, 1, "2024-10-14", "08:00", "20:00", 1000, "completed", ""),
    (2, 2, "2024-10-14", "08:00", "20:00", 800, "completed", ""),
    (3, 3, "2024-10-14", "08:00", "20:00", 950, "completed", ""),
    (4, 4, "2024-10-14", "08:00", "20:00", 1050, "completed", ""),
    (5, 5, "2024-10-14", "08:00", "20:00", 1100, "completed", ""),
    (1, 1, "2024-10-15", "08:00", "20:00", 1000, "in_progress", ""),
    (2, 2, "2024-10-15", "08:00", "20:00", 800, "in_progress", ""),
    (4, 4, "2024-10-15", "08:00", "20:00", 1050, "in_progress", ""),
    (5, 5, "2024-10-15", "08:00", "20:00", 1100, "in_progress", ""),
    (3, 3, "2024-10-15", "10:00", "22:00", 950, "rescheduled", "Line load balancing"),
    (6, 2, "2024-10-15", "08:00", "20:00", 500, "scheduled", "On hold - fabric shortage"),
    (0, 1, "2024-10-16", "08:00", "20:00", 900, "scheduled", ""),
    (1, 0, "2024-10-16", "08:00", "20:00", 1000, "scheduled", ""),
    (4, 5, "2024-10-16", "08:00", "20:00", 1050, "scheduled", "Night shift included"),
]:
    Schedule.objects.get_or_create(
        organization=org, production_order=prod_orders[mo_i], production_line=lines[line_i],
        scheduled_date=date.fromisoformat(sched_date),
        defaults={"start_time": start, "end_time": end, "target_quantity": target,
                  "status": status, "notes": notes},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
print(f"  Schedules: {Schedule.objects.count()}")
print("Done!")
