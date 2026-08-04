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
from production.models import ProductionOrder
from quality.models import (
    DefectCategory, FabricInspection, InlineQC,
    EndLineQC, RejectionReport, FinalInspection,
)

print("Seeding quality data...")

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

prod_orders = []
for mo_num, po_i, style_i, qty, start, end, status in [
    ("MO-2401", 0, 0, 12000, "2024-10-01", "2024-10-25", "completed"),
    ("MO-2402", 1, 1, 18500, "2024-10-03", "2024-11-02", "in_progress"),
    ("MO-2403", 2, 2, 9500, "2024-10-05", "2024-10-28", "in_progress"),
    ("MO-2404", 3, 3, 14200, "2024-10-07", "2024-11-10", "released"),
    ("MO-2405", 4, 4, 22000, "2024-10-10", "2024-11-20", "in_progress"),
    ("MO-2406", 5, 5, 16800, "2024-10-12", "2024-11-22", "released"),
    ("MO-2408", 3, 3, 6000, "2024-10-18", "2024-11-08", "pending"),
]:
    mo, _ = ProductionOrder.objects.get_or_create(
        organization=org, order_number=mo_num,
        defaults={"purchase_order": pos[po_i], "style": styles[style_i], "quantity": qty,
                  "start_date": date.fromisoformat(start), "end_date": date.fromisoformat(end), "status": status},
    )
    prod_orders.append(mo)

# ── Defect Categories ────────────────────────────────────────────────────────
defects = []
for name, code, desc in [
    ("Hole", "DEF-HL", "Hole in fabric or finished garment body"),
    ("Stain", "DEF-ST", "Oil, grease or dirt stain on fabric"),
    ("Color Shade Variation", "DEF-CSV", "Shade difference between panels or rolls"),
    ("Stitching Defect", "DEF-SD", "Broken, skipped or uneven stitching"),
    ("Open Seam", "DEF-OS", "Seam opened up or not properly closed"),
    ("Uneven Hem", "DEF-UH", "Hem width variation or wavy hem"),
    ("Button Defect", "DEF-BD", "Missing, loose or broken button"),
    ("Zipper Defect", "DEF-ZD", "Zipper malfunction or misaligned zipper tape"),
    ("Label Defect", "DEF-LD", "Wrong, missing or misplaced care/main label"),
    ("Misprint", "DEF-MP", "Faded, smudged or misaligned print"),
]:
    d, _ = DefectCategory.objects.get_or_create(organization=org, code=code, defaults={"name": name, "description": desc})
    defects.append(d)

def dc(i): return defects[i % len(defects)]

# ── Fabric Inspections ───────────────────────────────────────────────────────
for supplier, date_iso, total, rejected, def_i, status in [
    ("Envoy Textiles Ltd", "2024-10-02", 25000, 220, 2, "conditional"),
    ("DBL Group", "2024-10-04", 18400, 95, 1, "passed"),
    ("Fakir Knitwears", "2024-10-06", 22650, 140, 0, "passed"),
    ("Aman Spinning Ltd", "2024-10-08", 9800, 310, 2, "failed"),
    ("Noman Group", "2024-10-10", 15420, 60, 5, "passed"),
    ("Mohammadi Group", "2024-10-12", 20100, 175, 3, "conditional"),
]:
    passed = Decimal(str(total - rejected))
    FabricInspection.objects.get_or_create(
        organization=org, fabric_received_from=supplier, inspection_date=date.fromisoformat(date_iso),
        defaults={"supplier": supplier, "total_quantity": Decimal(str(total)), "inspected_quantity": Decimal(str(total)),
                  "passed_quantity": passed, "rejected_quantity": Decimal(str(rejected)),
                  "defect_category": dc(def_i), "status": status,
                  "notes": random.choice(["", "4-point system used", "Recheck required before cutting"]),
                  "inspected_by": random.choice(["Md. Rafiqul Islam", "Shirin Akter", "Abdul Karim"])},
    )

# ── Inline QC ────────────────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders):
    for d in range(2):
        checked = random.randint(400, 900)
        defects_qty = random.randint(0, 30)
        status = random.choice(["pass", "pass", "rework"])
        InlineQC.objects.get_or_create(
            production_order=mo, production_line=f"Line {(i % 6) + 1}", check_date=date(2024, 10, 14) + timedelta(days=i + d),
            defaults={"checked_quantity": checked, "defect_quantity": defects_qty, "defect_category": dc(i),
                      "defect_description": "Open seam at side" if status == "rework" else "",
                      "action_taken": "Re-stitching at repair table" if status == "rework" else "None",
                      "status": status, "checked_by": random.choice(["QC Inspector", "Sr. QC Officer"])},
        )

# ── End Line QC ──────────────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders):
    checked = random.randint(800, 1600)
    failed = random.randint(5, 40)
    EndLineQC.objects.get_or_create(
        production_order=mo, check_date=date(2024, 10, 15) + timedelta(days=i),
        defaults={"checked_quantity": checked, "passed_quantity": checked - failed, "failed_quantity": failed,
                  "defect_category": dc(i + 1),
                  "remarks": random.choice(["", "Minor issues to be corrected at finishing"]),
                  "status": "rework" if failed > 25 else "pass",
                  "checked_by": random.choice(["QC Inspector", "Sr. QC Officer"])},
    )

# ── Rejection Reports ────────────────────────────────────────────────────────
for i, (mo, stage) in enumerate([(po, s) for po in prod_orders for s in ["cutting", "sewing", "washing", "finishing", "packing"]]):
    if i >= 12:
        break
    RejectionReport.objects.get_or_create(
        production_order=mo, report_date=date(2024, 10, 16) + timedelta(days=i), stage=stage,
        defaults={"rejected_quantity": random.randint(3, 45), "defect_category": dc(i),
                  "defect_details": "Stain and open seam found at end of line",
                  "corrective_action": random.choice(["Repair and re-inspect", "Operator re-training", ""]),
                  "reported_by": random.choice(["Md. Rafiqul Islam", "Shirin Akter", "Abdul Karim"])},
    )

# ── Final Inspections ────────────────────────────────────────────────────────
for i, mo in enumerate(prod_orders):
    inspected = random.randint(2000, 5000)
    major = random.randint(0, 4)
    minor = random.randint(2, 20)
    status = "pass" if major == 0 else random.choice(["conditional", "fail"])
    FinalInspection.objects.get_or_create(
        production_order=mo, inspection_date=date(2024, 10, 17) + timedelta(days=i),
        defaults={"inspected_quantity": inspected, "passed_quantity": inspected - major - minor,
                  "failed_quantity": major + minor, "aql_level": "AQL 2.5",
                  "critical_defects": 0, "major_defects": major, "minor_defects": minor,
                  "status": status, "notes": random.choice(["", "AQL 2.5 single sampling"]),
                  "inspected_by": random.choice(["QA Manager", "Quality Assurance Team"])},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (DefectCategory, "Defect Categories"), (FabricInspection, "Fabric Inspections"),
    (InlineQC, "Inline QC"), (EndLineQC, "End Line QC"),
    (RejectionReport, "Rejection Reports"), (FinalInspection, "Final Inspections"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
