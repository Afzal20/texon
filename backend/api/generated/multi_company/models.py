from django.db import models
from django.conf import settings

class GroupCompany(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='group_company_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    registration_number = models.CharField(max_length=100)
    tax_id = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    base_currency = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'group_company'
        verbose_name = 'GroupCompany'
        verbose_name_plural = 'GroupCompaies'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class LocationBasedOperation(models.Model):
    multi_company = models.IntegerField()
    location = models.IntegerField()
    operation_type = models.CharField(max_length=50, choices=[('production', 'Production'), ('warehouse', 'Warehouse'), ('office', 'Office'), ('showroom', 'Showroom')])
    is_active = models.BooleanField()
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='location_based_operation_set',
    )

    class Meta:
        db_table = 'location_based_operation'
        verbose_name = 'LocationBasedOperation'
        verbose_name_plural = 'LocationBasedOperations'


class MultiCompany(models.Model):
    parent_company = models.IntegerField()
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    currency = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField()
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='multi_company_set',
    )

    class Meta:
        db_table = 'multi_company'
        verbose_name = 'MultiCompany'
        verbose_name_plural = 'MultiCompaies'
    def __str__(self):
        return str(getattr(self, 'name', ''))

