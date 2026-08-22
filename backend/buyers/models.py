from django.db import models


class Buyer(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    country = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    sequence = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Buyer"
        verbose_name_plural = "Buyers"
        unique_together = ("code",)
        ordering = ("sequence",)

    def __str__(self):
        return f"{self.name} ({self.code})"


class BuyerRating(models.Model):
    buyer = models.OneToOneField(
        Buyer, on_delete=models.CASCADE, related_name="rating"
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    reviews_count = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "BuyerRating"
        verbose_name_plural = "BuyerRatings"

    def __str__(self):
        return f"{self.buyer.name}: {self.rating}"


class BuyerPortfolio(models.Model):
    buyer = models.OneToOneField(
        Buyer, on_delete=models.CASCADE, related_name="portfolio"
    )
    active_orders = models.PositiveIntegerField(default=0)
    total_units = models.PositiveIntegerField(default=0)
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "BuyerPortfolio"
        verbose_name_plural = "BuyerPortfolios"

    def __str__(self):
        return f"{self.buyer.name} Portfolio"
