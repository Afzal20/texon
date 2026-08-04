import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from django.utils import timezone

from authentication.models import User, OTP

print("Seeding authentication data...")

def get_user(email, first_name, last_name, is_staff=False, is_superuser=False, is_verified=False, phone=""):
    user = User.objects.filter(email=email).first()
    if user:
        return user
    if is_superuser:
        return User.objects.create_superuser(email=email, password="Test@123", first_name=first_name, last_name=last_name, phone=phone, is_verified=is_verified)
    return User.objects.create_user(email=email, password="Test@123", first_name=first_name, last_name=last_name, phone=phone, is_staff=is_staff, is_verified=is_verified)

# ── Users ───────────────────────────────────────────────────────────────────
users = []
for email, first, last, is_staff, is_superuser, is_verified, phone in [
    ("admin@texon.com", "Tahsin", "Rahman", True, True, True, "+8801711000001"),
    ("merchant@texon.com", "Shakil", "Ahmed", True, False, True, "+8801711000002"),
    ("hr@texon.com", "Nusrat", "Jahan", True, False, True, "+8801711000003"),
    ("quality@texon.com", "Kamal", "Hossain", True, False, True, "+8801711000004"),
    ("ie@texon.com", "Rafiq", "Islam", True, False, True, "+8801711000005"),
    ("finance@texon.com", "Sabina", "Yasmin", True, False, True, "+8801711000006"),
    ("buyer@texon.com", "Maria", "Chowdhury", False, False, False, "+8801711000007"),
]:
    u = get_user(email, first, last, is_staff=is_staff, is_superuser=is_superuser, is_verified=is_verified, phone=phone)
    users.append(u)

# ── OTPs ────────────────────────────────────────────────────────────────────
for email, purpose, code, minutes, is_used in [
    ("merchant@texon.com", "password_reset", "482913", 10, False),
    ("merchant@texon.com", "email_verify", "774521", 15, False),
    ("hr@texon.com", "email_verify", "330987", 15, True),
    ("finance@texon.com", "password_reset", "651204", 10, False),
    ("admin@texon.com", "email_verify", "908172", 15, True),
]:
    OTP.objects.get_or_create(
        user=User.objects.get(email=email), purpose=purpose, code=code, is_used=is_used,
        defaults={"expires_at": timezone.now() + timedelta(minutes=minutes)},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (User, "Users"), (OTP, "OTPs"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
