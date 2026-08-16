import os, sys, random
from datetime import date, datetime, timedelta, time
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from django.utils import timezone

from buyers.models import Buyer
from merchandising.models import Style, PurchaseOrder
from production.models import (
    ProductionLine, ProductionOrder, CuttingRecord,
    SewingRecord, InspectionPacking, FloorRequisition,
    ProductionUnit, LineCapacity, ProductionShift, ProductionRecord,
    OEELog, DefectLog, HeatmapData, BottleneckAlert,
)

print("Seeding production data...")

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
    ("Nike Inc.", "NKE", "USA"), ("Adidas AG", "ADI", "Germany"),
]:
    b, _ = Buyer.objects.get_or_create(code=code, defaults={"name": name, "country": country})
    buyers.append(b)

styles = []
for name, snum in [("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"), ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"), ("Hoodie", "STY-005"), ("Track Pants", "STY-006")]:
    s, _ = Style.objects.get_or_create(style_number=snum, defaults={"name": name, "buyer": buyers[0]})
    styles.append(s)

pos = []
for po_num, buyer_i, style_i, qty, price, status in [
    ("PO-2401", 0, 0, 12000, "4.50", "in_production"),
    ("PO-2402", 1, 1, 18500, "6.75", "in_production"),
    ("PO-2403", 2, 2, 9500, "12.25", "confirmed"),
    ("PO-2404", 3, 3, 14200, "8.90", "in_production"),
    ("PO-2405", 4, 4, 22000, "5.60", "in_production"),
    ("PO-2406", 5, 5, 16800, "7.20", "confirmed"),
]:
    po, _ = PurchaseOrder.objects.get_or_create(
        po_number=po_num,
        defaults={"buyer": buyers[buyer_i], "style": styles[style_i],
                  "order_date": date(2024, 9, 10 + buyer_i), "delivery_date": date(2024, 12, 1),
                  "quantity": qty, "unit_price": Decimal(price),
                  "total_value": Decimal(str(round(qty * Decimal(price), 2))), "status": status},
    )
    pos.append(po)

# ── Production Lines ─────────────────────────────────────────────────────────
lines = []
for name, code, loc, cap in [
    ("Line 1", "LN-01", "Unit 1, Ashulia", 500), ("Line 2", "LN-02", "Unit 1, Ashulia", 600),
    ("Line 3", "LN-03", "Unit 2, Gazipur", 800), ("Line 4", "LN-04", "Unit 2, Gazipur", 900),
    ("Line 5", "LN-05", "Unit 3, Savar", 1000), ("Line 6", "LN-06", "Unit 3, Savar", 1200),
]:
    ln, _ = ProductionLine.objects.get_or_create(code=code, defaults={"name": name, "location": loc, "capacity": cap})
    lines.append(ln)

# ── Production Units ─────────────────────────────────────────────────────────
units = []
for name, loc in [("Unit 1", "Ashulia"), ("Unit 2", "Gazipur"), ("Unit 3", "Savar")]:
    u, _ = ProductionUnit.objects.get_or_create(name=name, defaults={"location": loc})
    units.append(u)
for idx, ln in enumerate(lines):
    matched = None
    for u in units:
        if u.location.lower() in ln.location.lower():
            matched = u
            break
    if matched is None:
        matched = units[idx % len(units)]
    ln.production_unit = matched
    ln.save(update_fields=["production_unit"])

# ── Line Capacities ──────────────────────────────────────────────────────────
for ln in lines:
    for d in range(7):
        cap = ln.capacity + random.choice([-50, 0, 0, 50, 100])
        LineCapacity.objects.get_or_create(
            production_line=ln, date=date(2024, 10, 13 + d),
            defaults={"daily_capacity_pcs": cap},
        )

# ── Production Shifts ────────────────────────────────────────────────────────
for ln in lines:
    ProductionShift.objects.get_or_create(
        production_line=ln, name="Day Shift",
        defaults={"start_time": time(7, 0), "end_time": time(19, 0)},
    )
    ProductionShift.objects.get_or_create(
        production_line=ln, name="Night Shift",
        defaults={"start_time": time(19, 0), "end_time": time(7, 0)},
    )

# ── Production Records ───────────────────────────────────────────────────────
for ln in lines:
    for d in range(5):
        ProductionRecord.objects.get_or_create(
            production_line=ln, date=date(2024, 10, 13 + d),
            defaults={"output_quantity": random.randint(400, ln.capacity),
                      "notes": random.choice(["", "OT deployed", "Normal run"])},
        )

# ── OEE Logs ─────────────────────────────────────────────────────────────────
for ln in lines:
    for d in range(4):
        ts = timezone.make_aware(datetime(2024, 10, 15 + d, 9, 0))
        avail = round(random.uniform(88, 98), 2)
        perf = round(random.uniform(75, 92), 2)
        qual = round(random.uniform(96, 99.5), 2)
        OEELog.objects.get_or_create(
            production_line=ln, timestamp=ts,
            defaults={"availability_rate": Decimal(str(avail)), "performance_rate": Decimal(str(perf)),
                      "quality_rate": Decimal(str(qual)), "oee_score": Decimal(str(round(avail * perf * qual / 10000, 2)))},
        )

# ── Defect Logs ──────────────────────────────────────────────────────────────
for ln in lines:
    for d in range(3):
        checked = random.randint(800, 1500)
        defects = random.randint(4, 40)
        DefectLog.objects.get_or_create(
            production_line=ln, date=date(2024, 10, 14 + d),
            defaults={"defect_type": random.choice(["Sewing", "Stitching", "Stain", "Size"]),
                      "checked_quantity": checked, "defect_quantity": defects,
                      "defect_rate": Decimal(str(round(defects * 100 / checked, 3)))},
        )

# ── Heatmap Data ─────────────────────────────────────────────────────────────
for ln in lines:
    for metric in ["efficiency", "output", "utilization", "attendance"]:
        HeatmapData.objects.get_or_create(
            production_line=ln, metric=metric,
            timestamp=timezone.make_aware(datetime(2024, 10, 17, 12, 0)),
            defaults={"value": Decimal(str(round(random.uniform(60, 98), 2)))},
        )

# ── Bottleneck Alerts ────────────────────────────────────────────────────────
for i, ln in enumerate(lines):
    BottleneckAlert.objects.get_or_create(
        production_line=ln, alert_message=f"Throughput below target on {ln.name}",
        defaults={"is_resolved": i % 2 == 0,
                  "resolved_at": timezone.make_aware(datetime(2024, 10, 16, 10, 0)) if i % 2 == 0 else None},
    )
    BottleneckAlert.objects.get_or_create(
        production_line=ln, alert_message="High WIP at collar attach station",
        defaults={"is_resolved": False, "resolved_at": None},
    )

# ── Production Orders ────────────────────────────────────────────────────────
prod_orders = []
for mo_num, po_i, style_i, line_i, qty, start, end, status in [
    ("MO-2401", 0, 0, 0, 12000, "2024-10-01", "2024-10-25", "completed"),
    ("MO-2402", 1, 1, 1, 18500, "2024-10-03", "2024-11-02", "in_progress"),
    ("MO-2403", 2, 2, 2, 9500, "2024-10-05", "2024-10-28", "in_progress"),
    ("MO-2404", 3, 3, 3, 14200, "2024-10-07", "2024-11-10", "released"),
    ("MO-2405", 4, 4, 4, 22000, "2024-10-10", "2024-11-20", "in_progress"),
    ("MO-2406", 5, 5, 5, 16800, "2024-10-12", "2024-11-22", "released"),
    ("MO-2407", 0, 0, 2, 6000, "2024-10-15", "2024-10-30", "on_hold"),
    ("MO-2408", 3, 3, 1, 6000, "2024-10-18", "2024-11-08", "pending"),
]:
    mo, _ = ProductionOrder.objects.get_or_create(
        order_number=mo_num,
        defaults={"purchase_order": pos[po_i], "style": styles[style_i], "production_line": lines[line_i],
                  "quantity": qty, "start_date": date.fromisoformat(start), "end_date": date.fromisoformat(end),
                  "status": status, "notes": "Allocated via production planning" if status == "in_progress" else ""},
    )
    prod_orders.append(mo)

# ── Cutting Records ──────────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders[:6]):
    for d in range(2):
        cdate = date(2024, 10, 14) + timedelta(days=i + d)
        qty = random.randint(700, 1500)
        CuttingRecord.objects.get_or_create(
            production_order=mo, date=cdate,
            defaults={"quantity_cut": qty, "fabric_used": Decimal(str(round(qty * Decimal("1.25"), 2))),
                      "waste_quantity": Decimal(str(round(qty * Decimal("0.025"), 2))),
                      "notes": random.choice(["", "Fabric shade checked before spreading", "Marker efficiency 92%"])},
        )

# ── Sewing Records ───────────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders[:6]):
    for d in range(3):
        sdate = date(2024, 10, 15) + timedelta(days=i + d)
        output = random.randint(650, 1200)
        SewingRecord.objects.get_or_create(
            production_order=mo, production_line=mo.production_line, date=sdate,
            defaults={"input_quantity": output + random.randint(5, 25), "output_quantity": output,
                      "defect_quantity": random.randint(2, 18), "efficiency": Decimal(str(round(random.uniform(62, 78), 2))),
                      "notes": random.choice(["", "Helpers deployed for hemming", "Machine breakdown 20 min"])},
        )

# ── Inspection & Packing ─────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders[:6]):
    for d in range(2):
        idate = date(2024, 10, 16) + timedelta(days=i + d)
        inspected = random.randint(800, 1400)
        failed = random.randint(1, 25)
        InspectionPacking.objects.get_or_create(
            production_order=mo, date=idate,
            defaults={"inspected_quantity": inspected, "passed_quantity": inspected - failed,
                      "failed_quantity": failed, "packed_quantity": inspected - failed,
                      "notes": random.choice(["", "Poly bag & carton packing", "Size-wise packing done"])},
        )

# ── Floor Requisitions ───────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders[:6]):
    for item_type, qty in [
        ("Fabric (Cotton Jersey)", random.randint(500, 3000)),
        ("Thread (100% Polyester)", random.randint(2000, 6000)),
        ("Main Label", random.randint(1000, 5000)),
        ("Poly Bag", random.randint(1000, 4000)),
        ("Carton (60x40x40 cm)", random.randint(100, 800)),
    ]:
        FloorRequisition.objects.get_or_create(
            production_order=mo, item_type=item_type, request_date=date(2024, 10, 10 + i),
            defaults={"quantity_requested": qty, "quantity_approved": qty if i % 3 else None,
                      "status": random.choice(["issued", "approved", "pending"]),
                      "notes": random.choice(["", "Urgent for next day production"])},
        )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (ProductionUnit, "Production Units"), (ProductionLine, "Production Lines"),
    (LineCapacity, "Line Capacities"), (ProductionShift, "Production Shifts"),
    (ProductionRecord, "Production Records"), (OEELog, "OEE Logs"),
    (DefectLog, "Defect Logs"), (HeatmapData, "Heatmap Data"),
    (BottleneckAlert, "Bottleneck Alerts"), (ProductionOrder, "Production Orders"),
    (CuttingRecord, "Cutting Records"), (SewingRecord, "Sewing Records"),
    (InspectionPacking, "Inspection & Packing"), (FloorRequisition, "Floor Requisitions"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
