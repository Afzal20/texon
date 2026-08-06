import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from buyers.models import Buyer, BuyerRating, BuyerPortfolio

print("Seeding buyers data...")

# ── Buyers ──────────────────────────────────────────────────────────────────
buyers = []
for code, name, country, contact, email, phone, active in [
    ("HM", "H&M Group", "Sweden", "Emma Lindqvist", "buying@hm.com", "+46-8-796-5500", True),
    ("ZRA", "Zara (Inditex)", "Spain", "Carlos Mendez", "buying@zara.com", "+34-981-185-400", True),
    ("UNQ", "Uniqlo (Fast Retailing)", "Japan", "Yuki Tanaka", "buying@uniqlo.com", "+81-3-6865-0050", True),
    ("LEV", "Levi Strauss & Co.", "USA", "Michael Porter", "buying@levi.com", "+1-415-501-6000", True),
    ("NKE", "Nike Inc.", "USA", "Sarah Johnson", "buying@nike.com", "+1-503-671-6453", True),
    ("ADI", "Adidas AG", "Germany", "Lukas Weber", "buying@adidas.com", "+49-9132-84-0", True),
    ("CNA", "C&A Europe", "Germany", "Anna Schmidt", "buying@c-and-a.com", "+49-211-9872-0", True),
    ("WMT", "Walmart Inc.", "USA", "David Chen", "buying@walmart.com", "+1-479-273-4000", True),
    ("PRM", "Primark Stores Ltd", "UK", "Oliver Brown", "buying@primark.com", "+44-20-8962-5500", True),
    ("TGT", "Target Corporation", "USA", "Jessica Lee", "buying@target.com", "+1-612-304-6073", True),
    ("MNS", "Marks & Spencer", "UK", "Helen Clarke", "buying@marksandspencer.com", "+44-20-7935-4422", True),
    ("HSP", "Hush Puppies (Wolverine)", "USA", "Tom Harris", "buying@wolverine.com", "+1-616-866-5500", True),
]:
    b, _ = Buyer.objects.get_or_create(
        code=code,
        defaults={"name": name, "country": country, "contact_person": contact,
                  "email": email, "phone": phone, "is_active": active},
    )
    buyers.append(b)

# ── Buyer Ratings ───────────────────────────────────────────────────────────
for b, rating, reviews in zip(
    buyers,
    ["4.80", "4.55", "4.70", "4.65", "4.40", "4.75", "4.35", "4.50", "4.60", "4.45", "4.85", "4.25"],
    [128, 96, 110, 87, 142, 133, 74, 158, 92, 69, 121, 58],
):
    BuyerRating.objects.get_or_create(buyer=b, defaults={"rating": Decimal(rating), "reviews_count": reviews})

# ── Buyer Portfolios ────────────────────────────────────────────────────────
for b, orders, units, value in zip(
    buyers,
    [24, 18, 21, 15, 32, 27, 12, 36, 16, 11, 19, 9],
    [480000, 315000, 402000, 268000, 610000, 545000, 196000, 728000, 284000, 173000, 352000, 121000],
    ["4286000", "3150000", "3892000", "2564000", "5873000", "5146000", "1829000", "6935000", "2712000", "1658000", "3367000", "1156000"],
):
    BuyerPortfolio.objects.get_or_create(buyer=b, defaults={"active_orders": orders, "total_units": units, "total_value": Decimal(value)})

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Buyer, "Buyers"), (BuyerRating, "Buyer Ratings"), (BuyerPortfolio, "Buyer Portfolios"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
