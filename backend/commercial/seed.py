import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization, Currency
from buyers.models import Buyer
from procurement.models import Supplier
from merchandising.models import Style
from orders.models import Order
from commercial.models import (
    Shipment, LetterOfCredit, Invoice, BillOfExchange,
    SupplierDocument, Realization, SODFCTransfer, Disbursement,
)

print("Seeding commercial data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})
usd, _ = Currency.objects.get_or_create(code="USD", defaults={"name": "US Dollar", "symbol": "$", "exchange_rate": 1.0, "is_base": True})

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
    ("Nike Inc.", "NKE", "USA"), ("Adidas AG", "ADI", "Germany"),
]:
    b, _ = Buyer.objects.get_or_create(organization=org, code=code, defaults={"name": name, "country": country})
    buyers.append(b)

suppliers = []
for name, code, stype in [
    ("Envoy Textiles Ltd", "ENV", "fabric"), ("Coats Bangladesh", "CTS", "trim"),
    ("YKK Bangladesh", "YKK", "accessory"), ("Pacific Accessories", "PAC", "accessory"),
    ("DBL Group", "DBL", "fabric"), ("Fakir Knitwears", "FKW", "fabric"),
]:
    s, _ = Supplier.objects.get_or_create(organization=org, code=code, defaults={"name": name, "supplier_type": stype})
    suppliers.append(s)

styles = []
for name, snum in [("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"), ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"), ("Hoodie", "STY-005"), ("Track Pants", "STY-006")]:
    s, _ = Style.objects.get_or_create(organization=org, style_number=snum, defaults={"name": name, "buyer": buyers[0]})
    styles.append(s)

orders = []
for i, buyer in enumerate(buyers):
    o, _ = Order.objects.get_or_create(
        organization=org, order_number=f"PO-{84920 + i}",
        defaults={"buyer": buyer, "style": styles[i], "order_date": date(2024, 9, 1), "delivery_date": date(2024, 12, 1),
                  "quantity": random.randint(2000, 8000), "unit_price": Decimal("14.50"), "total_value": Decimal("85000"), "status": "confirmed"},
    )
    orders.append(o)

def bi(i): return buyers[i % len(buyers)]
def si(i): return suppliers[i % len(suppliers)]

# ── LCs ─────────────────────────────────────────────────────────────────────
lcs = []
for lc_num, lc_type, buyer_i, supplier_i, amount, issue, expiry, status in [
    ("LC-8842", "export", 0, 0, 428600, "2024-10-01", "2024-11-30", "issued"),
    ("LC-8836", "export", 1, 1, 356240, "2024-09-28", "2024-11-25", "issued"),
    ("LC-8830", "export", 2, 2, 284900, "2024-09-25", "2024-11-20", "amended"),
    ("LC-8824", "export", 3, 3, 196800, "2024-09-20", "2024-11-15", "expired"),
    ("LC-8818", "import", 4, 4, 542000, "2024-10-05", "2024-12-01", "issued"),
    ("LC-8812", "import", 5, 5, 318500, "2024-10-02", "2024-11-28", "issued"),
    ("BTB-2418", "btb", 0, 0, 186420, "2024-10-08", "2024-11-30", "issued"),
    ("BTB-2415", "btb", 1, 1, 94800, "2024-10-06", "2024-11-25", "issued"),
    ("BTB-2412", "btb", 2, 2, 22760, "2024-10-04", "2024-11-20", "amended"),
    ("BTB-2408", "btb", 3, 3, 54980, "2024-10-01", "2024-11-15", "draft"),
    ("LC-8805", "export", 4, 4, 612400, "2024-09-15", "2024-11-10", "issued"),
    ("LC-8798", "import", 5, 5, 275300, "2024-09-12", "2024-11-08", "expired"),
    ("LC-8790", "export", 0, 0, 389700, "2024-09-10", "2024-11-05", "issued"),
    ("LC-8782", "import", 1, 1, 465200, "2024-09-08", "2024-11-02", "issued"),
    ("LC-8775", "export", 2, 2, 198400, "2024-09-05", "2024-10-30", "expired"),
    ("BTB-2405", "btb", 4, 4, 128600, "2024-09-28", "2024-11-25", "issued"),
    ("LC-8768", "export", 3, 3, 521800, "2024-09-01", "2024-10-28", "issued"),
    ("LC-8760", "import", 5, 5, 347900, "2024-08-28", "2024-10-25", "expired"),
    ("BTB-2402", "btb", 0, 0, 167300, "2024-09-25", "2024-11-20", "issued"),
    ("LC-8752", "export", 1, 1, 298500, "2024-08-25", "2024-10-20", "amended"),
]:
    lc, _ = LetterOfCredit.objects.get_or_create(
        organization=org, lc_number=lc_num,
        defaults={"lc_type": lc_type, "buyer": bi(buyer_i), "supplier": si(supplier_i),
                  "amount": Decimal(str(amount)), "currency": usd, "issue_date": date.fromisoformat(issue),
                  "expiry_date": date.fromisoformat(expiry), "bank_name": random.choice(["Citibank", "HSBC", "Standard Chartered"]),
                  "status": status, "amendment_count": 1 if status == "amended" else 0},
    )
    lcs.append(lc)

# ── Shipments ───────────────────────────────────────────────────────────────
shipments = []
for shp_num, direction, buyer_i, supplier_i, pol, pod, carrier, container, etd, eta, status, clr in [
    ("SHP-2418", "import", 0, 0, "Dhaka", "Chittagong", "MAERSK", "MAEU2836451", "2024-10-08", "2024-10-18", "in_transit", "in_progress"),
    ("SHP-2415", "export", 1, 1, "Chittagong", "Rotterdam", "MSC", "MSCU7291035", "2024-10-10", "2024-11-02", "in_transit", "pending"),
    ("SHP-2412", "import", 2, 2, "Shanghai", "Chittagong", "COSCO", "COSU6182947", "2024-10-05", "2024-10-22", "arrived", "in_progress"),
    ("SHP-2408", "export", 3, 3, "Chittagong", "Long Beach", "Hapag-Lloyd", "HLCU3928174", "2024-10-01", "2024-11-15", "booked", "pending"),
    ("SHP-2405", "import", 4, 4, "Mumbai", "Chittagong", "Evergreen", "EGLV9823417", "2024-09-28", "2024-10-15", "delivered", "cleared"),
    ("SHP-2402", "export", 5, 5, "Chittagong", "Hamburg", "ONE", "ONEY4729183", "2024-09-25", "2024-10-20", "delivered", "cleared"),
    ("SHP-2398", "import", 0, 0, "Ho Chi Minh", "Chittagong", "ZIM", "ZIMU8372645", "2024-09-20", "2024-10-10", "delivered", "cleared"),
    ("SHP-2395", "export", 1, 1, "Chittagong", "Felixstowe", "CMA CGM", "CMAU5291738", "2024-09-18", "2024-10-12", "shipped", "pending"),
    ("SHP-2392", "import", 2, 2, "Busan", "Chittagong", "PIL", "PILU3948271", "2024-09-15", "2024-10-08", "delivered", "cleared"),
    ("SHP-2388", "export", 3, 3, "Chittagong", "Savannah", "Yang Ming", "YMLU8293746", "2024-09-12", "2024-10-25", "in_transit", "pending"),
    ("SHP-2385", "import", 4, 4, "Colombo", "Chittagong", "HMM", "HMMU6382914", "2024-09-10", "2024-10-05", "arrived", "in_progress"),
    ("SHP-2382", "export", 5, 5, "Chittagong", "Antwerp", "Wan Hai", "WHLU7492831", "2024-09-08", "2024-10-18", "shipped", "pending"),
    ("SHP-2378", "import", 0, 0, "Laem Chabang", "Chittagong", "RCL", "RCLU8293647", "2024-09-05", "2024-09-28", "delivered", "cleared"),
    ("SHP-2375", "export", 1, 1, "Chittagong", "New York", "Matson", "MATU5729384", "2024-09-02", "2024-10-15", "shipped", "pending"),
    ("SHP-2372", "import", 2, 2, "Port Klang", "Chittagong", "OOCL", "OOLU8294736", "2024-08-28", "2024-09-22", "delivered", "cleared"),
]:
    s, _ = Shipment.objects.get_or_create(
        organization=org, shipment_number=shp_num,
        defaults={"buyer": bi(buyer_i), "supplier": si(supplier_i), "direction": direction, "shipment_type": "sea",
                  "port_of_loading": pol, "port_of_discharge": pod, "container_number": container,
                  "forwarder": random.choice(["DHL Global", "Flexport", "Expeditors"]),
                  "carrier": carrier, "shipment_date": date.fromisoformat(etd), "etd": date.fromisoformat(etd), "eta": date.fromisoformat(eta),
                  "status": status, "clearance_status": clr, "gross_weight": Decimal("15000"), "volume_cbm": Decimal("45")},
    )
    shipments.append(s)

# ── Invoices ────────────────────────────────────────────────────────────────
invoices = []
for inv_num, buyer_i, lc_i, amount, inv_date, status, paid in [
    ("INV-2418", 0, 0, 428600, "2024-10-14", "paid", 428600),
    ("INV-2415", 1, 1, 356240, "2024-10-13", "paid", 356240),
    ("INV-2412", 2, 2, 284900, "2024-10-12", "submitted", 0),
    ("INV-2408", 3, 3, 196800, "2024-10-10", "draft", 0),
    ("INV-2405", 4, 4, 542000, "2024-10-08", "paid", 542000),
    ("INV-2402", 5, 5, 318500, "2024-10-05", "paid", 318500),
    ("INV-2398", 0, 6, 186420, "2024-10-01", "paid", 186420),
    ("INV-2395", 1, 7, 94800, "2024-09-28", "paid", 94800),
    ("INV-2392", 2, 8, 22760, "2024-09-25", "overdue", 0),
    ("INV-2388", 3, 9, 54980, "2024-09-22", "submitted", 0),
    ("INV-2385", 4, 10, 612400, "2024-09-20", "paid", 612400),
    ("INV-2382", 5, 11, 275300, "2024-09-18", "paid", 275300),
    ("INV-2378", 0, 12, 389700, "2024-09-15", "paid", 389700),
    ("INV-2375", 1, 13, 465200, "2024-09-12", "paid", 465200),
    ("INV-2372", 2, 14, 198400, "2024-09-10", "paid", 198400),
]:
    inv, _ = Invoice.objects.get_or_create(
        organization=org, invoice_number=inv_num,
        defaults={"buyer": bi(buyer_i), "supplier": si(buyer_i), "lc": lcs[lc_i],
                  "invoice_date": date.fromisoformat(inv_date), "due_date": date.fromisoformat(inv_date) + timedelta(days=30),
                  "amount": Decimal(str(amount)), "currency": usd, "status": status, "paid_amount": Decimal(str(paid)),
                  "payment_terms": "Net 30"},
    )
    invoices.append(inv)

# ── Bills of Exchange ────────────────────────────────────────────────────────
bills = []
for boe_num, inv_i, lc_i, amount, bank, issue, maturity, status in [
    ("BDE-2418", 0, 0, 428600, "Citibank", "2024-10-15", "2024-11-15", "negotiated"),
    ("BDE-2415", 1, 1, 356240, "HSBC", "2024-10-14", "2024-11-14", "under_review"),
    ("BDE-2412", 2, 2, 284900, "Standard Chartered", "2024-10-12", "2024-11-12", "negotiated"),
    ("BDE-2408", 3, 3, 196800, "Citibank", "2024-10-10", "2024-11-10", "submitted"),
    ("BDE-2405", 4, 4, 542000, "Bank Asia", "2024-10-08", "2024-11-08", "negotiated"),
    ("BDE-2402", 5, 5, 318500, "HSBC", "2024-10-05", "2024-11-05", "negotiated"),
    ("BDE-2398", 6, 6, 186420, "Standard Chartered", "2024-10-01", "2024-11-01", "negotiated"),
    ("BDE-2395", 7, 7, 94800, "Prime Bank", "2024-09-28", "2024-10-28", "negotiated"),
    ("BDE-2392", 8, 8, 22760, "Bank Asia", "2024-09-25", "2024-10-25", "under_review"),
    ("BDE-2388", 9, 9, 54980, "Citibank", "2024-09-22", "2024-10-22", "draft"),
    ("BDE-2385", 10, 10, 612400, "HSBC", "2024-09-20", "2024-10-20", "negotiated"),
    ("BDE-2382", 11, 11, 275300, "Standard Chartered", "2024-09-18", "2024-10-18", "negotiated"),
]:
    b, _ = BillOfExchange.objects.get_or_create(
        organization=org, bill_number=boe_num,
        defaults={"lc": lcs[lc_i], "buyer": invoices[inv_i].buyer, "bank_name": bank,
                  "amount": Decimal(str(amount)), "currency": usd,
                  "issue_date": date.fromisoformat(issue), "maturity_date": date.fromisoformat(maturity), "status": status},
    )
    bills.append(b)

# ── Realizations ────────────────────────────────────────────────────────────
for rlz_num, inv_i, expected, realized, due, rdate, status, reason, short_amt in [
    ("RLZ-2418", 0, 428600, 428600, "2024-11-15", "2024-11-15", "realized", "", 0),
    ("RLZ-2415", 1, 356240, 356240, "2024-11-12", "2024-11-12", "realized", "", 0),
    ("RLZ-2412", 2, 284900, 278620, "2024-11-08", "2024-11-08", "short", "quality_deduction", 6280),
    ("RLZ-2408", 3, 196800, 0, "2024-11-01", None, "overdue", "", 0),
    ("RLZ-2405", 4, 542000, 542000, "2024-10-28", "2024-10-28", "realized", "", 0),
    ("RLZ-2402", 5, 318500, 318500, "2024-10-25", "2024-10-25", "realized", "", 0),
    ("RLZ-2398", 6, 186420, 186420, "2024-10-22", "2024-10-22", "realized", "", 0),
    ("RLZ-2395", 7, 94800, 94800, "2024-10-18", "2024-10-18", "realized", "", 0),
    ("RLZ-2392", 8, 22760, 21480, "2024-10-15", "2024-10-15", "short", "rate_dispute", 1280),
    ("RLZ-2388", 9, 54980, 0, "2024-10-12", None, "expected", "", 0),
    ("RLZ-2385", 10, 612400, 612400, "2024-10-08", "2024-10-08", "realized", "", 0),
    ("RLZ-2382", 11, 275300, 275300, "2024-10-05", "2024-10-05", "realized", "", 0),
]:
    Realization.objects.get_or_create(
        organization=org, realization_number=rlz_num,
        defaults={"buyer": invoices[inv_i].buyer, "invoice": invoices[inv_i],
                  "expected_amount": Decimal(str(expected)), "realized_amount": Decimal(str(realized)), "currency": usd,
                  "due_date": date.fromisoformat(due), "realization_date": date.fromisoformat(rdate) if rdate else None,
                  "status": status, "short_reason": reason, "short_amount": Decimal(str(short_amt))},
    )

# ── SOD/FC Transfers ────────────────────────────────────────────────────────
for trf_num, trf_type, bank, amount, trf_date, status in [
    ("TRF-2418", "fc", "Citibank", 428600, "2024-10-15", "acknowledged"),
    ("TRF-2415", "sod", "HSBC", 186420, "2024-10-14", "acknowledged"),
    ("TRF-2412", "fc", "Standard Chartered", 356240, "2024-10-12", "pending"),
    ("TRF-2408", "sod", "Citibank", 94800, "2024-10-10", "acknowledged"),
    ("TRF-2405", "fc", "Bank Asia", 542000, "2024-10-08", "acknowledged"),
    ("TRF-2402", "sod", "HSBC", 318500, "2024-10-05", "acknowledged"),
]:
    SODFCTransfer.objects.get_or_create(
        organization=org, transfer_number=trf_num,
        defaults={"transfer_type": trf_type, "bank_name": bank, "amount": Decimal(str(amount)), "currency": usd,
                  "transfer_date": date.fromisoformat(trf_date), "status": status,
                  "acknowledged_by": "Finance Team" if status == "acknowledged" else ""},
    )

# ── Disbursements ───────────────────────────────────────────────────────────
for dis_num, category, amount, dis_date, status in [
    ("DIS-2418", "material_purchase", 186420, "2024-10-15", "disbursed"),
    ("DIS-2415", "freight_charges", 42800, "2024-10-14", "disbursed"),
    ("DIS-2412", "customs_duty", 28600, "2024-10-13", "pending_approval"),
    ("DIS-2408", "supplier_payment", 94800, "2024-10-12", "disbursed"),
    ("DIS-2405", "material_purchase", 542000, "2024-10-10", "disbursed"),
    ("DIS-2402", "freight_charges", 38500, "2024-10-08", "disbursed"),
    ("DIS-2398", "material_purchase", 186420, "2024-10-05", "disbursed"),
    ("DIS-2395", "customs_duty", 18600, "2024-10-02", "disbursed"),
    ("DIS-2392", "bank_charges", 4200, "2024-09-28", "disbursed"),
    ("DIS-2388", "insurance", 8900, "2024-09-25", "pending_approval"),
]:
    Disbursement.objects.get_or_create(
        organization=org, disbursement_number=dis_num,
        defaults={"category": category, "amount": Decimal(str(amount)), "currency": usd,
                  "disbursement_date": date.fromisoformat(dis_date), "status": status,
                  "approved_by": "Finance Manager" if status == "disbursed" else ""},
    )

# ── Supplier Documents ───────────────────────────────────────────────────────
doc_types = ["bill_of_lading", "commercial_invoice", "packing_list", "certificate_of_origin"]
for i, shp in enumerate(shipments[:10]):
    for j, doc_type in enumerate(random.sample(doc_types, k=3)):
        SupplierDocument.objects.get_or_create(
            organization=org, document_number=f"DOC-{2418 - i}-{j + 1}",
            defaults={"supplier": shp.supplier, "shipment": shp, "document_type": doc_type,
                      "received_date": shp.eta + timedelta(days=random.randint(0, 3)),
                      "status": random.choice(["accepted", "accepted", "pending"])},
        )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (LetterOfCredit, "LCs"), (Shipment, "Shipments"), (Invoice, "Invoices"),
    (BillOfExchange, "Bills of Exchange"), (SupplierDocument, "Supplier Docs"),
    (Realization, "Realizations"), (SODFCTransfer, "SOD/FC Transfers"), (Disbursement, "Disbursements"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
