from django.db import models
from django.contrib.auth.models import AbstractUser

from .managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True, max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.TextField(blank=True, default="")
    is_verified = models.BooleanField(default=False)
    employee = models.OneToOneField(
        "hr.Employee",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="user_account",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email


class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    code = models.CharField(max_length=6)
    purpose = models.CharField(
        max_length=20,
        choices=[("password_reset", "Password Reset"), ("email_verify", "Email Verification")],
    )
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"

    def __str__(self):
        return f"{self.user.email} - {self.purpose} - {self.code}"


class SocialAuthCallbackUrl(models.Model):
    provider = models.CharField(
        max_length=50,
        choices=[("google", "Google"), ("github", "GitHub")],
        unique=True
    )
    callback_url = models.URLField(max_length=255)

    class Meta:
        ordering = ["-id"]
        verbose_name = "SocialAuthCallbackUrl"
        verbose_name_plural = "SocialAuthCallbackUrls"

    def __str__(self):
        return f"{self.get_provider_display()} - {self.callback_url}"
