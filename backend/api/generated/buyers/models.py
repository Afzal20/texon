from django.db import models
from django.conf import settings

class Buyer(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='buyer_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    country = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    is_active = models.BooleanField()
    rating = models.CharField(max_length=255, null=True, blank=True, editable=False)

    class Meta:
        db_table = 'buyer'
        verbose_name = 'Buyer'
        verbose_name_plural = 'Buyers'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class BuyerPortfolio(models.Model):
    buyer = models.IntegerField(editable=False)
    active_orders = models.IntegerField(editable=False)
    total_units = models.IntegerField(editable=False)
    total_value = models.DecimalField(editable=False, max_digits=15, decimal_places=2)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='buyer_portfolio_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyer_portfolio'
        verbose_name = 'BuyerPortfolio'
        verbose_name_plural = 'BuyerPortfolios'


class BuyerRating(models.Model):
    buyer = models.IntegerField(editable=False)
    rating = models.DecimalField(editable=False, max_digits=15, decimal_places=2)
    reviews_count = models.IntegerField(editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='buyer_rating_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyer_rating'
        verbose_name = 'BuyerRating'
        verbose_name_plural = 'BuyerRatings'

