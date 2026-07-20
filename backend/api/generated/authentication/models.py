from django.db import models
from django.conf import settings

class ForgotPassword(models.Model):
    email = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='forgot_password_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forgot_password'
        verbose_name = 'ForgotPassword'
        verbose_name_plural = 'ForgotPasswords'


class Login(models.Model):
    email = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='login_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'login'
        verbose_name = 'Login'
        verbose_name_plural = 'Logins'


class Register(models.Model):
    email = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    password2 = models.CharField(max_length=255)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='register_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'register'
        verbose_name = 'Register'
        verbose_name_plural = 'Registers'


class ResetPassword(models.Model):
    email = models.CharField(max_length=255)
    code = models.CharField(max_length=6)
    new_password = models.CharField(max_length=255)
    new_password2 = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='reset_password_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reset_password'
        verbose_name = 'ResetPassword'
        verbose_name_plural = 'ResetPasswords'
    def __str__(self):
        return str(getattr(self, 'code', ''))


class UpdatePassword(models.Model):
    old_password = models.CharField(max_length=255)
    new_password = models.CharField(max_length=255)
    new_password2 = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='update_password_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'update_password'
        verbose_name = 'UpdatePassword'
        verbose_name_plural = 'UpdatePasswords'


class User(models.Model):
    email = models.CharField(max_length=255, editable=False)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    is_verified = models.BooleanField(editable=False)
    date_joined = models.DateTimeField(editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='user_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class VerifyOTP(models.Model):
    email = models.CharField(max_length=255)
    code = models.CharField(max_length=6)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='verify_otp_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'verify_otp'
        verbose_name = 'VerifyOTP'
        verbose_name_plural = 'VerifyOTPs'
    def __str__(self):
        return str(getattr(self, 'code', ''))

