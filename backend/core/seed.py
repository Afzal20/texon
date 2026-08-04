import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization, Location, Currency

print("Seeding core data...")

org, _ = Organization.objects.get_or_create(
    code="TEXON",
    defaults={"name": "Texon RMG Ltd", "address": "House 10, Road 5, Gulshan-1, Dhaka 1212, Bangladesh",
              "phone": "+880-2-55667788", "email": "info@texon.com", "website": "https://www.texon.com", "is_active": True},
)

# ── Currencies ──────────────────────────────────────────────────────────────
for code, name, symbol, rate, is_base in [
    ("USD", "US Dollar", "$", 1.0, True),
    ("BDT", "Bangladeshi Taka", "Tk", 110.0, False),
    ("EUR", "Euro", "EUR", 0.92, False),
    ("GBP", "British Pound", "GBP", 0.79, False),
    ("INR", "Indian Rupee", "INR", 83.5, False),
]:
    Currency.objects.get_or_create(code=code, defaults={"name": name, "symbol": symbol, "exchange_rate": Decimal(str(rate)), "is_base": is_base})

# ── Locations ───────────────────────────────────────────────────────────────
for code, name, city, country, address in [
    ("DAC", "Dhaka Head Office", "Dhaka", "Bangladesh", "House 10, Road 5, Gulshan-1, Dhaka 1212"),
    ("CGP", "Chittagong Factory", "Chittagong", "Bangladesh", "Plot 45, CEPZ, North Patenga, Chittagong 4223"),
    ("GUL", "Gazipur Industrial Unit", "Gazipur", "Bangladesh", "Kashimpur, Kaliakoir, Gazipur 1750"),
]:
    Location.objects.get_or_create(organization=org, code=code, defaults={"name": name, "address": address, "city": city, "country": country, "is_active": True})

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Organization, "Organizations"), (Location, "Locations"), (Currency, "Currencies"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
