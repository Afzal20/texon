import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from buyers.models import Buyer
from merchandising.models import Style
from orders.models import Order

print("Seeding orders data...")

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

def bi(i): return buyers[i % len(buyers)]
def si(i): return styles[i % len(styles)]

# ── Orders ───────────────────────────────────────────────────────────────────
for i, (buyer_i, style_i, order_num, order_date, delivery_date, qty, price, status, priority, note) in enumerate([
    (0, 0, "PO-85000", "2024-08-01", "2024-10-01", 15000, "2.85", "in_production", "high", "Basic tee, 5 colors"),
    (1, 1, "PO-85001", "2024-08-03", "2024-10-05", 8000, "3.50", "confirmed", "medium", "Classic polo, 4 colors"),
    (2, 2, "PO-85002", "2024-08-06", "2024-10-10", 6000, "8.75", "in_production", "high", "Denim jacket, 2 washes"),
    (3, 3, "PO-85003", "2024-08-09", "2024-10-15", 12000, "5.20", "shipped", "medium", "Chino pants, 3 colors"),
    (4, 4, "PO-85004", "2024-08-12", "2024-10-20", 10000, "6.40", "confirmed", "urgent", "Hoodie, fleece"),
    (5, 5, "PO-85005", "2024-08-15", "2024-10-25", 7000, "4.80", "pending", "low", "Track pants with drawstring"),
    (0, 3, "PO-85006", "2024-08-18", "2024-11-01", 20000, "5.10", "confirmed", "high", "Repeat chino order"),
    (1, 0, "PO-85007", "2024-08-21", "2024-11-05", 18000, "2.90", "in_production", "medium", "Extra white tees"),
    (2, 4, "PO-85008", "2024-08-24", "2024-11-10", 5000, "7.20", "delivered", "medium", "Zip hoodies"),
    (3, 2, "PO-85009", "2024-08-27", "2024-11-15", 4000, "9.30", "cancelled", "low", "Cancelled by buyer"),
]):
    o, _ = Order.objects.get_or_create(
        order_number=order_num,
        defaults={"buyer": bi(buyer_i), "style": si(style_i), "order_date": date.fromisoformat(order_date),
                  "delivery_date": date.fromisoformat(delivery_date), "quantity": qty,
                  "unit_price": Decimal(price), "total_value": Decimal(str(round(qty * float(price), 2))),
                  "status": status, "priority": priority, "notes": note},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [(Order, "Orders")]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
