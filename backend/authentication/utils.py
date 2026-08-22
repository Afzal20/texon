import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import OTP


def generate_otp(length=6):
    """Cryptographically secure numeric OTP (use `secrets`, never `random`)."""
    return "".join(secrets.choice("0123456789") for _ in range(length))


def create_and_send_otp(user, purpose="password_reset"):
    # Invalidate any previous unused OTPs of the same purpose so only the
    # newest code is valid.
    OTP.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)

    code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=10)

    OTP.objects.create(user=user, code=code, purpose=purpose, expires_at=expires_at)

    subject = {
        "password_reset": "Password Reset OTP",
        "email_verify": "Email Verification OTP",
    }.get(purpose, "OTP")

    message = f"Your {subject.lower()} code is: {code}\nThis code expires in 10 minutes."

    user.email_user(subject, message)

    return code