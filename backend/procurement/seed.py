import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization
from inventory.models import Fabric, Accessory, Trim
from procurement.models import (
    Supplier, RawMaterialRequisition, RawMaterialBooking, QuotationAnalysis,
)

print("Seeding procurement data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

# Base inventory items (in case inventory/seed.py has not been run yet)
fabrics = list(Fabric.objects.filter(organization=org))
if not fabrics:
    f, _ = Fabric.objects.get_or_create(organization=org, code="FAB-001", defaults={"name": "100% Cotton Single Jersey"})
    fabrics = [f]
accessories = list(Accessory.objects.filter(organization=org))
if not accessories:
    a, _ = Accessory.objects.get_or_create(organization=org, code="ACC-001", defaults={"name": "Button 18L Black"})
    accessories = [a]
trims = list(Trim.objects.filter(organization=org))
if not trims:
    t, _ = Trim.objects.get_or_create(organization=org, code="TRM-001", defaults={"name": "Sewing Thread White"})
    trims = [t]

# ── Suppliers ────────────────────────────────────────────────────────────────
suppliers = []
for name, code, stype, cp, phone in [
    ("Envoy Textiles Ltd", "ENV", "fabric", "Rafiul Islam", "+880 1711-223344"),
    ("Coats Bangladesh", "CTS", "trim", "Tanvir Ahmed", "+880 1812-445566"),
    ("YKK Bangladesh", "YKK", "accessory", "Sharmin Akter", "+880 1913-667788"),
    ("Pacific Accessories", "PAC", "accessory", "Kamal Hossain", "+880 1624-889900"),
    ("DBL Group", "DBL", "fabric", "Nazrul Islam", "+880 1725-112233"),
    ("Fakir Knitwears", "FKW", "fabric", "Sabbir Rahman", "+880 1836-445566"),
    ("Square Textiles Ltd", "SQ", "fabric", "Minhaj Chowdhury", "+880 1917-778899"),
    ("Apex Textile Mills", "APX", "fabric", "Farid Ahmed", "+880 1788-990011"),
]:
    s, _ = Supplier.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "supplier_type": stype, "contact_person": cp, "phone": phone,
                  "email": f"{code.lower()}@example.com", "address": "Gazipur Industrial Park, Dhaka",
                  "rating": Decimal(str(random.choice(["4.50", "4.20", "4.80", "4.10"])))},
    )
    suppliers.append(s)

pools = {"fabric": fabrics, "accessory": accessories, "trim": trims}
def pi(item_type): return random.choice(pools[item_type])

# ── Raw Material Requisitions ────────────────────────────────────────────────
for i, (req_num, item_type, qty, req_date, status, by, approved, purpose) in enumerate([
    ("REQ-2401", "fabric", 8500, "2024-08-05", "approved", "Md. Kamal Hossain", "Sabbir Rahman", "Grey fabric for STY-001"),
    ("REQ-2402", "fabric", 4200, "2024-08-08", "ordered", "Md. Kamal Hossain", "Sabbir Rahman", "Pique for STY-002"),
    ("REQ-2403", "fabric", 2800, "2024-08-10", "approved", "Rafiqul Islam", "Sabbir Rahman", "Denim 12oz for STY-003"),
    ("REQ-2404", "accessory", 30000, "2024-08-12", "received", "Shamima Akter", "", "Buttons for STY-001"),
    ("REQ-2405", "accessory", 18000, "2024-08-15", "ordered", "Shamima Akter", "", "Zippers for STY-004"),
    ("REQ-2406", "trim", 1200, "2024-08-18", "approved", "Rafiqul Islam", "Sabbir Rahman", "Threads for sewing line"),
    ("REQ-2407", "trim", 800, "2024-08-20", "pending_approval", "Md. Kamal Hossain", "", "Elastic for track pants"),
    ("REQ-2408", "fabric", 5500, "2024-08-22", "draft", "Rafiqul Islam", "", "Fleece for STY-005"),
]):
    item = pi(item_type)
    RawMaterialRequisition.objects.get_or_create(
        organization=org, requisition_number=req_num,
        defaults={"item_type": item_type, "item_id": item.id, "quantity": Decimal(str(qty)),
                  "required_date": date.fromisoformat(req_date), "purpose": purpose,
                  "status": status, "requested_by": by, "approved_by": approved},
    )

# ── Raw Material Bookings ────────────────────────────────────────────────────
for i, (bkg_num, supplier_i, item_type, qty, price, bkg_date, expected, status, note) in enumerate([
    ("BKG-2401", 0, "fabric", 9000, "2.75", "2024-08-06", "2024-09-20", "received", "Single jersey white"),
    ("BKG-2402", 0, "fabric", 4500, "3.30", "2024-08-09", "2024-09-25", "confirmed", "Pique navy"),
    ("BKG-2403", 5, "fabric", 3000, "4.15", "2024-08-11", "2024-09-28", "confirmed", "Denim 12oz indigo"),
    ("BKG-2404", 2, "accessory", 32000, "0.02", "2024-08-13", "2024-09-15", "received", "Buttons 18L"),
    ("BKG-2405", 2, "accessory", 20000, "0.38", "2024-08-16", "2024-09-22", "partial_received", "YKK zipper #5"),
    ("BKG-2406", 1, "trim", 1400, "1.15", "2024-08-19", "2024-09-18", "received", "Thread cones 4000m"),
    ("BKG-2407", 3, "accessory", 25000, "0.12", "2024-08-21", "2024-09-30", "confirmed", "Hangers"),
    ("BKG-2408", 7, "fabric", 5800, "3.90", "2024-08-23", "2024-10-05", "draft", "Brushed fleece charcoal"),
]):
    item = pi(item_type)
    qty_dec = Decimal(str(qty))
    up = Decimal(price)
    RawMaterialBooking.objects.get_or_create(
        organization=org, booking_number=bkg_num,
        defaults={"supplier": suppliers[supplier_i], "booking_date": date.fromisoformat(bkg_date),
                  "expected_delivery_date": date.fromisoformat(expected),
                  "item_type": item_type, "item_id": item.id, "quantity": qty_dec,
                  "unit_price": up, "total_value": qty_dec * up, "status": status, "notes": note},
    )

# ── Quotation Analyses ───────────────────────────────────────────────────────
for i, (supplier_i, item_type, qty, price, del_terms, pay_terms, validity, status) in enumerate([
    (0, "Fabric - 100% Cotton Single Jersey", 9000, "2.85", "FOB Chittagong", "LC at Sight", "2024-09-30", "accepted"),
    (5, "Fabric - 100% Cotton Single Jersey", 9000, "2.95", "CIF Chittagong", "Net 30", "2024-09-30", "rejected"),
    (6, "Fabric - Denim 12oz", 3000, "4.20", "Ex-Factory", "LC at Sight", "2024-10-01", "accepted"),
    (2, "Zippers - YKK #5", 20000, "0.40", "Ex-Factory", "Net 30", "2024-10-01", "accepted"),
    (3, "Hangers - Plastic", 25000, "0.13", "Ex-Factory", "Cash on Delivery", "2024-10-05", "negotiating"),
    (1, "Threads - 4000m cones", 1400, "1.20", "Ex-Factory", "Net 30", "2024-10-05", "accepted"),
    (3, "Poly Bags - M size", 30000, "0.06", "FOB Chittagong", "Advance Payment", "2024-10-10", "pending"),
    (7, "Fabric - Brushed Fleece", 5800, "3.95", "CIF Chittagong", "LC at Sight", "2024-10-10", "pending"),
]):
    QuotationAnalysis.objects.get_or_create(
        organization=org, supplier=suppliers[supplier_i], item_type=item_type,
        quantity=Decimal(str(qty)), quoted_price=Decimal(price), validity_date=date.fromisoformat(validity),
        defaults={"delivery_terms": del_terms, "payment_terms": pay_terms, "status": status},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Supplier, "Suppliers"), (RawMaterialRequisition, "RM Requisitions"),
    (RawMaterialBooking, "RM Bookings"), (QuotationAnalysis, "Quotation Analyses"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
