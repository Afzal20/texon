import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from datetime import datetime

from django.utils import timezone

from buyers.models import Buyer
from merchandising.models import Style, PurchaseOrder
from crm.models import BuyerCommunication, BuyerProfitability, OrderAmendmentHistory

print("Seeding crm data...")

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
]:
    b, _ = Buyer.objects.get_or_create(code=code, defaults={"name": name, "country": country})
    buyers.append(b)

styles = []
for name, snum in [
    ("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"),
    ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"),
]:
    s, _ = Style.objects.get_or_create(style_number=snum, defaults={"name": name, "buyer": buyers[0]})
    styles.append(s)

orders = []
for i, (po_num, qty, unit, total, st) in enumerate([
    ("PO-2401", 8200, "4.20", "34440.00", "in_production"),
    ("PO-2402", 5600, "5.80", "32480.00", "in_production"),
    ("PO-2403", 10400, "3.95", "41080.00", "confirmed"),
    ("PO-2404", 7300, "6.40", "46720.00", "confirmed"),
]):
    o, _ = PurchaseOrder.objects.get_or_create(
        po_number=po_num,
        defaults={"buyer": buyers[i % len(buyers)], "style": styles[i], "order_date": date(2024, 8, 15) + timedelta(days=i * 10),
                  "delivery_date": date(2024, 10, 25) + timedelta(days=i * 10), "quantity": qty,
                  "unit_price": Decimal(unit), "total_value": Decimal(total), "status": st},
    )
    orders.append(o)

# ── Buyer Communications ────────────────────────────────────────────────────
for buyer_i, ctype, subject, person, cdate, fudate, st, by in [
    (0, "email", "Follow-up on PO-2401 delivery", "Sarah Lin", "2024-10-02 10:30", "2024-10-09", "pending_follow_up", "Merchandiser Rafi"),
    (1, "meeting", "Quarterly business review", "Carlos Mendez", "2024-10-01 14:00", None, "completed", "Merchandiser Rafi"),
    (2, "video_call", "Sample approval - Denim Jacket", "Yuki Tanaka", "2024-09-28 09:00", None, "completed", "Merchandiser Rafi"),
    (3, "phone", "Fabric price negotiation", "David Miller", "2024-09-25 16:30", None, "closed", "Merchandiser Rafi"),
    (0, "email", "Shipment documents for SHP-2415", "Sarah Lin", "2024-09-24 11:00", None, "completed", "Commercial Team"),
    (1, "site_visit", "Factory audit preparation", "Carlos Mendez", "2024-09-22 10:00", None, "completed", "Compliance Team"),
    (0, "email", "Follow-up on PO-2402 delivery", "Sarah Lin", "2024-09-20 09:45", "2024-09-27", "pending_follow_up", "Merchandiser Rafi"),
    (1, "meeting", "New season order discussion", "Carlos Mendez", "2024-09-18 15:00", None, "closed", "Merchandiser Rafi"),
    (2, "email", "LC amendment request", "Yuki Tanaka", "2024-09-15 12:30", None, "completed", "Commercial Team"),
    (3, "video_call", "Quality concern on STY-003", "David Miller", "2024-09-12 10:00", None, "completed", "Quality Team"),
]:
    BuyerCommunication.objects.get_or_create(
        buyer=buyers[buyer_i], communication_type=ctype, subject=subject,
        defaults={"content": f"{subject} - discussion summary and action points.",
                  "contact_person": person,
                  "communication_date": timezone.make_aware(datetime.fromisoformat(cdate)),
                  "follow_up_date": date.fromisoformat(fudate) if fudate else None,
                  "status": st, "created_by": by},
    )

# ── Buyer Profitability ─────────────────────────────────────────────────────
for buyer_i, ps, pe, rev, cost, prof, mrg in [
    (0, "2024-01-01", "2024-03-31", 1850000, 1450000, 400000, 21.62),
    (0, "2024-04-01", "2024-06-30", 2100000, 1640000, 460000, 21.90),
    (0, "2024-07-01", "2024-09-30", 1950000, 1520000, 430000, 22.05),
    (1, "2024-01-01", "2024-03-31", 980000, 760000, 220000, 22.45),
    (1, "2024-04-01", "2024-06-30", 1120000, 880000, 240000, 21.43),
    (2, "2024-01-01", "2024-03-31", 780000, 610000, 170000, 21.79),
    (2, "2024-04-01", "2024-06-30", 860000, 670000, 190000, 22.09),
    (3, "2024-01-01", "2024-03-31", 540000, 430000, 110000, 20.37),
]:
    BuyerProfitability.objects.get_or_create(
        buyer=buyers[buyer_i], period_start=date.fromisoformat(ps), period_end=date.fromisoformat(pe),
        defaults={"total_revenue": Decimal(str(rev)), "total_cost": Decimal(str(cost)),
                  "profit": Decimal(str(prof)), "profit_margin": Decimal(str(mrg))},
    )

# ── Order Amendment History ─────────────────────────────────────────────────
for po_i, adate, prev, new, reason, by in [
    (0, "2024-09-05", '{"quantity": 8500, "delivery_date": "2024-10-20"}',
     '{"quantity": 8200, "delivery_date": "2024-10-25"}', "Buyer reduced order quantity", "Sarah Lin (H&M)"),
    (1, "2024-09-10", '{"delivery_date": "2024-10-18"}',
     '{"delivery_date": "2024-10-22"}', "Buyer requested later delivery to align with season", "Carlos Mendez (Zara)"),
    (2, "2024-09-15", '{"unit_price": 3.95, "total_value": 41080.00}',
     '{"unit_price": 3.85, "total_value": 40040.00}', "Price renegotiation after fabric cost drop", "Merchandiser Rafi"),
    (0, "2024-09-18", '{"quantity": 8200}', '{"quantity": 8500}',
     "Buyer added 300 pcs to existing PO", "Sarah Lin (H&M)"),
    (3, "2024-09-22", '{"delivery_date": "2024-10-25"}',
     '{"delivery_date": "2024-11-05"}', "Delivery split into two shipments", "David Miller (Levi)"),
    (1, "2024-09-25", '{"quantity": 5600, "label_type": "woven"}',
     '{"quantity": 5600, "label_type": "printed"}', "Label type changed per buyer instruction", "Yuki Tanaka (Uniqlo)"),
]:
    OrderAmendmentHistory.objects.get_or_create(
        purchase_order=orders[po_i], amendment_date=date.fromisoformat(adate),
        defaults={"previous_value": prev, "new_value": new, "reason": reason, "amended_by": by},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [
    (BuyerCommunication, "Buyer Communications"), (BuyerProfitability, "Buyer Profitability"),
    (OrderAmendmentHistory, "Order Amendments"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
