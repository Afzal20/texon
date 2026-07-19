import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

from .models import OTP


def generate_otp(length=6):
    return "".join(random.choices("0123456789", k=length))


def create_and_send_otp(user, purpose="password_reset"):
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
