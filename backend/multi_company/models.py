from django.db import models
from core.models import Currency


class GroupCompany(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    registration_number = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    base_currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Group Company"
        verbose_name_plural = "Group Companies"
        unique_together = ("code",)

    def __str__(self):
        return f"{self.name} ({self.code})"


class MultiCompany(models.Model):
    parent_company = models.ForeignKey(
        GroupCompany, on_delete=models.CASCADE, related_name="subsidiaries"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Multi Company"
        verbose_name_plural = "Multi Companies"
        unique_together = ("parent_company", "code")

    def __str__(self):
        return f"{self.name} ({self.code})"


class LocationBasedOperation(models.Model):
    multi_company = models.ForeignKey(
        MultiCompany, on_delete=models.CASCADE, related_name="locations"
    )
    location = models.ForeignKey(
        "core.Location", on_delete=models.CASCADE, related_name="multi_company_operations"
    )
    operation_type = models.CharField(
        max_length=50,
        choices=[
            ("production", "Production"),
            ("warehouse", "Warehouse"),
            ("office", "Office"),
            ("showroom", "Showroom"),
        ],
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Location Based Operation"
        verbose_name_plural = "Location Based Operations"

    def __str__(self):
        return f"{self.multi_company.name} - {self.location.name}"
