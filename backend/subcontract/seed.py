import os, sys
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization
from buyers.models import Buyer
from merchandising.models import Style, PurchaseOrder
from subcontract.models import SubcontractOrder, SubcontractTracking

print("Seeding subcontract data...")

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

# ── Subcontract Orders ───────────────────────────────────────────────────────
subcontracts = []
for sc_num, style_i, po_i, sub_name, process, qty, rate, total, start, expected, actual, status in [
    ("SC-2401", 0, 0, "Dhaka Wash Works", "washing", 12000, "35.00", "420000.00", "2024-10-05", "2024-10-20", "2024-10-19", "completed"),
    ("SC-2402", 1, 1, "Swiss Tex Embroidery", "embroidery", 18500, "8.50", "157250.00", "2024-10-07", "2024-10-25", None, "in_progress"),
    ("SC-2403", 2, 2, "Printo Graphix Ltd", "printing", 9500, "12.00", "114000.00", "2024-10-08", "2024-10-22", "2024-10-21", "completed"),
    ("SC-2404", 3, 3, "Dhaka Wash Works", "washing", 14200, "38.00", "539600.00", "2024-10-10", "2024-10-28", None, "in_progress"),
    ("SC-2405", 4, 4, "Adorsho Denim Wash", "washing", 11000, "42.00", "462000.00", "2024-10-12", "2024-11-01", None, "in_progress"),
    ("SC-2406", 5, 5, "Swiss Tex Embroidery", "embroidery", 16800, "9.25", "155400.00", "2024-10-14", "2024-10-30", None, "delayed"),
    ("SC-2407", 0, 0, "Printo Graphix Ltd", "printing", 6000, "11.50", "69000.00", "2024-10-15", "2024-10-26", None, "pending"),
    ("SC-2408", 2, 2, "Mirpur Garments Finishing", "finishing", 9500, "6.00", "57000.00", "2024-10-16", "2024-10-24", None, "pending"),
]:
    sc, _ = SubcontractOrder.objects.get_or_create(
        organization=org, order_number=sc_num,
        defaults={"style": styles[style_i], "purchase_order": pos[po_i], "subcontractor_name": sub_name,
                  "process": process, "quantity": qty, "rate": Decimal(rate), "total_value": Decimal(total),
                  "start_date": date.fromisoformat(start), "expected_completion": date.fromisoformat(expected),
                  "actual_completion": date.fromisoformat(actual) if actual else None, "status": status,
                  "notes": "Approved subcontractor - BMET listed" if process == "washing" else ""},
    )
    subcontracts.append(sc)

# ── Subcontract Tracking ─────────────────────────────────────────────────────
for sc_i, tdate, received, passed, rejected, status, remarks in [
    (0, "2024-10-12", 5000, 4990, 10, "received", "Batch 1 received from wash plant"),
    (0, "2024-10-15", 4500, 4495, 5, "received", "Batch 2 received"),
    (0, "2024-10-18", 2500, 2495, 5, "completed", "Final batch received - order complete"),
    (1, "2024-10-14", 6000, 5980, 20, "received", "Embroidery hoops inspected"),
    (1, "2024-10-17", 8000, 7975, 25, "in_progress", "Stitching ongoing at vendor"),
    (2, "2024-10-12", 5000, 4990, 10, "received", "Print quality approved"),
    (2, "2024-10-15", 4500, 4492, 8, "completed", "All print batches received"),
    (3, "2024-10-16", 7000, 6985, 15, "in_progress", "Washing in progress"),
    (4, "2024-10-18", 6000, 5980, 20, "in_progress", "Enzyme wash batch in process"),
    (5, "2024-10-16", 4000, 3990, 10, "delayed", "Delay due to machine breakdown at vendor"),
    (6, "2024-10-19", 2000, 1995, 5, "received", "First print batch received"),
    (7, "2024-10-20", 3000, 2998, 2, "received", "Finishing quality check done"),
]:
    SubcontractTracking.objects.get_or_create(
        subcontract_order=subcontracts[sc_i], tracking_date=date.fromisoformat(tdate),
        defaults={"quantity_received": received, "quantity_passed": passed,
                  "quantity_rejected": rejected, "status": status, "remarks": remarks},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (SubcontractOrder, "Subcontract Orders"), (SubcontractTracking, "Subcontract Tracking"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
