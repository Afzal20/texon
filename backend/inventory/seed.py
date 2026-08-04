import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization
from inventory.models import (
    Warehouse, Fabric, Accessory, Trim, StockMovement, ShadeApproval, PhysicalInventory,
)

print("Seeding inventory data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

# ── Warehouses ───────────────────────────────────────────────────────────────
warehouses = []
for name, code, loc in [
    ("Fabric Warehouse", "FWH", "Unit-1, Gazipur"),
    ("Accessories Store", "ACS", "Unit-1, Gazipur"),
    ("Finish Goods Store", "FGS", "Unit-2, Savar"),
]:
    w, _ = Warehouse.objects.get_or_create(
        organization=org, code=code, defaults={"name": name, "location": loc}
    )
    warehouses.append(w)

# ── Fabrics ─────────────────────────────────────────────────────────────────
fabrics = []
for name, code, comp, color, qty, price in [
    ("100% Cotton Single Jersey", "FAB-001", "100% Cotton", "White", 18500, "2.85"),
    ("Cotton-Polyester 60/40 Jersey", "FAB-002", "60% Cotton 40% Polyester", "Black", 12400, "2.60"),
    ("Cotton Lycra 95/5", "FAB-003", "95% Cotton 5% Lycra", "Navy", 9800, "3.10"),
    ("Pique Knit", "FAB-004", "100% Cotton", "Red", 7200, "3.40"),
    ("French Terry", "FAB-005", "80% Cotton 20% Polyester", "Grey", 6500, "3.80"),
    ("Interlock Knit", "FAB-006", "100% Cotton", "Sky Blue", 5400, "3.25"),
    ("Rib Knit 1x1", "FAB-007", "100% Cotton", "Black", 4300, "2.95"),
    ("Denim 12oz", "FAB-008", "100% Cotton Denim", "Indigo", 8800, "4.20"),
    ("Brushed Back Fleece", "FAB-009", "65% Cotton 35% Polyester", "Charcoal", 5100, "3.95"),
    ("Twill 100% Cotton", "FAB-010", "100% Cotton", "Khaki", 3700, "3.60"),
]:
    f, _ = Fabric.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "warehouse": warehouses[0], "color": color, "composition": comp,
                  "width": Decimal("58.00"), "quantity": qty, "unit": "meters",
                  "threshold_quantity": random.randint(800, 2000), "unit_price": Decimal(price)},
    )
    fabrics.append(f)

# ── Accessories ──────────────────────────────────────────────────────────────
accessories = []
for name, code, cat, qty, price in [
    ("Button 18L Black", "ACC-001", "Button", 120000, "0.02"),
    ("Button 24L White", "ACC-002", "Button", 85000, "0.03"),
    ("YKK Zipper #5 Metal", "ACC-003", "Zipper", 30000, "0.45"),
    ("YKK Zipper #3 Nylon", "ACC-004", "Zipper", 22000, "0.32"),
    ("Snap Button 15mm", "ACC-005", "Button", 60000, "0.04"),
    ("Plastic Hanger", "ACC-006", "Hanger", 25000, "0.12"),
    ("Poly Bag M", "ACC-007", "Poly Bag", 40000, "0.06"),
    ("Size Label", "ACC-008", "Label", 150000, "0.01"),
    ("Care Label", "ACC-009", "Label", 120000, "0.01"),
    ("Main Label Woven", "ACC-010", "Label", 90000, "0.08"),
]:
    a, _ = Accessory.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "warehouse": warehouses[1], "category": cat, "quantity": qty,
                  "unit": "pcs", "threshold_quantity": random.randint(2000, 8000),
                  "unit_price": Decimal(price)},
    )
    accessories.append(a)

# ── Trims ────────────────────────────────────────────────────────────────────
trims = []
for name, code, qty, price in [
    ("Sewing Thread White", "TRM-001", 1800, "1.20"),
    ("Sewing Thread Black", "TRM-002", 1600, "1.20"),
    ("Fusing 20g Interlining", "TRM-003", 900, "1.80"),
    ("Drawstring 3mm", "TRM-004", 700, "0.35"),
    ("Elastic Band 1in", "TRM-005", 500, "0.60"),
    ("Tape 5mm Grosgrain", "TRM-006", 800, "0.45"),
]:
    t, _ = Trim.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "warehouse": warehouses[1], "quantity": qty,
                  "unit": "rolls", "threshold_quantity": random.randint(50, 200),
                  "unit_price": Decimal(price)},
    )
    trims.append(t)

# ── Stock Movements ──────────────────────────────────────────────────────────
movements = [
    ("STM-2401", "fabric", 0, 0, "in", 5000, "Delivery from Envoy Textiles Ltd"),
    ("STM-2402", "fabric", 0, 2, "transfer", 1200, "Transfer to sewing floor"),
    ("STM-2403", "fabric", 0, 2, "out", 2500, "Issued for cutting of STY-001"),
    ("STM-2404", "accessory", 1, 0, "in", 30000, "Delivery from YKK Bangladesh"),
    ("STM-2405", "accessory", 1, 2, "out", 15000, "Issued for packing of STY-002"),
    ("STM-2406", "accessory", 1, 1, "return", 500, "Defective buttons returned to supplier"),
    ("STM-2407", "trim", 1, 2, "in", 600, "Delivery from Coats Bangladesh"),
    ("STM-2408", "trim", 1, 2, "out", 350, "Issued to sewing section"),
    ("STM-2409", "fabric", 0, 0, "in", 3200, "Delivery from DBL Group"),
    ("STM-2410", "fabric", 0, 2, "waste", 85, "Cutting waste for STY-003"),
]
pools = {"fabric": fabrics, "accessory": accessories, "trim": trims}
for ref, item_type, frm_i, to_i, mtype, qty, note in movements:
    item = random.choice(pools[item_type])
    StockMovement.objects.get_or_create(
        organization=org, reference_number=ref,
        defaults={"item_type": item_type, "item_id": item.id,
                  "from_warehouse": warehouses[frm_i], "to_warehouse": warehouses[to_i],
                  "movement_type": mtype, "quantity": Decimal(str(qty)),
                  "notes": note, "created_by": random.choice(["Md. Kamal Hossain", "Shamima Akter", "Rafiqul Islam"])},
    )

# ── Shade Approvals ──────────────────────────────────────────────────────────
for i, fabric in enumerate(fabrics):
    for shade_name, shade_code, status in [
        ("Dove White", f"SHA-{i + 1:03d}A", "approved"),
        ("Jet Black", f"SHA-{i + 1:03d}B", "pending"),
        ("Royal Navy", f"SHA-{i + 1:03d}C", "rejected"),
    ]:
        ShadeApproval.objects.get_or_create(
            fabric=fabric, shade_code=shade_code,
            defaults={"shade_name": shade_name, "approved_by": random.choice(["Md. Kamal Hossain", "Shamima Akter"]),
                      "approval_date": date(2024, 9, 1) + timedelta(days=i),
                      "status": status, "notes": "Lamp D65 daylight standard"},
        )

# ── Physical Inventories ─────────────────────────────────────────────────────
for i, (wh, inv_date, status) in enumerate([
    (0, "2024-12-20", "verified"), (0, "2024-11-20", "completed"),
    (1, "2024-12-21", "completed"), (1, "2024-11-21", "verified"),
    (2, "2024-12-22", "in_progress"), (2, "2024-11-22", "draft"),
]):
    PhysicalInventory.objects.get_or_create(
        warehouse=warehouses[wh], inventory_date=date.fromisoformat(inv_date),
        defaults={"status": status, "created_by": "Md. Kamal Hossain",
                  "notes": f"Quarterly stock count at {warehouses[wh].name}"},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Warehouse, "Warehouses"), (Fabric, "Fabrics"), (Accessory, "Accessories"),
    (Trim, "Trims"), (StockMovement, "Stock Movements"),
    (ShadeApproval, "Shade Approvals"), (PhysicalInventory, "Physical Inventories"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
