import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Location, Currency
from multi_company.models import GroupCompany, MultiCompany, LocationBasedOperation

print("Seeding multi_company data...")

usd, _ = Currency.objects.get_or_create(code="USD", defaults={"name": "US Dollar", "symbol": "$", "exchange_rate": 1.0, "is_base": True})
bdt, _ = Currency.objects.get_or_create(code="BDT", defaults={"name": "Bangladeshi Taka", "symbol": "Tk", "exchange_rate": 110.0, "is_base": False})
eur, _ = Currency.objects.get_or_create(code="EUR", defaults={"name": "Euro", "symbol": "EUR", "exchange_rate": 0.92, "is_base": False})

dac, _ = Location.objects.get_or_create(code="DAC", defaults={"name": "Dhaka Head Office", "city": "Dhaka", "country": "Bangladesh"})
cgp, _ = Location.objects.get_or_create(code="CGP", defaults={"name": "Chittagong Factory", "city": "Chittagong", "country": "Bangladesh"})
gul, _ = Location.objects.get_or_create(code="GUL", defaults={"name": "Gazipur Industrial Unit", "city": "Gazipur", "country": "Bangladesh"})

# ── Group Companies ─────────────────────────────────────────────────────────
tgh, _ = GroupCompany.objects.get_or_create(
    code="TGH",
    defaults={"name": "Texon Group Holdings Ltd", "registration_number": "C-148273", "tax_id": "BD-4821930",
              "address": "House 10, Road 5, Gulshan-1, Dhaka 1212, Bangladesh",
              "country": "Bangladesh", "base_currency": bdt, "is_active": True},
)

# ── Multi Companies ─────────────────────────────────────────────────────────
companies = {}
for code, name, country, currency, address in [
    ("TXG", "Texon Garments Ltd", "Bangladesh", bdt, "Plot 45, CEPZ, North Patenga, Chittagong 4223"),
    ("TXE", "Texon Exports Ltd", "Bangladesh", bdt, "House 10, Road 5, Gulshan-1, Dhaka 1212"),
    ("TXI", "Texon International FZE", "UAE", usd, "JAFZA, Plot S20412, Jebel Ali, Dubai, UAE"),
    ("TXR", "Texon Europe GmbH", "Germany", eur, "Sachsenring 21, 50677 Cologne, Germany"),
]:
    mc, _ = MultiCompany.objects.get_or_create(
        parent_company=tgh, code=code,
        defaults={"name": name, "address": address, "country": country, "currency": currency, "is_active": True},
    )
    companies[code] = mc

# ── Location Based Operations ───────────────────────────────────────────────
for mc_code, loc_code, op_type in [
    ("TXG", "CGP", "production"),
    ("TXG", "DAC", "office"),
    ("TXG", "GUL", "warehouse"),
    ("TXE", "DAC", "office"),
    ("TXE", "CGP", "production"),
    ("TXI", "DAC", "office"),
    ("TXI", "GUL", "warehouse"),
    ("TXR", "DAC", "office"),
    ("TXR", "GUL", "showroom"),
]:
    LocationBasedOperation.objects.get_or_create(
        multi_company=companies[mc_code], location=Location.objects.get(code=loc_code),
        defaults={"operation_type": op_type, "is_active": True},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (GroupCompany, "Group Companies"), (MultiCompany, "Multi Companies"), (LocationBasedOperation, "Location Based Operations"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
