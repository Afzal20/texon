from django.db import models
from django.conf import settings

class BuyerCommunication(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='buyer_communication_set',
    )
    buyer = models.IntegerField()
    communication_type = models.CharField(max_length=50, choices=[('email', 'Email'), ('phone', 'Phone'), ('meeting', 'Meeting'), ('site_visit', 'Site Visit'), ('video_call', 'Video Call'), ('other', 'Other')])
    subject = models.CharField(max_length=255)
    content = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    communication_date = models.DateTimeField()
    follow_up_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('completed', 'Completed'), ('pending_follow_up', 'Pending Follow Up'), ('closed', 'Closed')])
    created_by = models.CharField(max_length=255, editable=False)

    class Meta:
        db_table = 'buyer_communication'
        verbose_name = 'BuyerCommunication'
        verbose_name_plural = 'BuyerCommunications'


class BuyerProfitability(models.Model):
    buyer = models.IntegerField(editable=False)
    period_start = models.DateField(editable=False)
    period_end = models.DateField(editable=False)
    total_revenue = models.DecimalField(editable=False, max_digits=15, decimal_places=2)
    total_cost = models.DecimalField(editable=False, max_digits=15, decimal_places=2)
    profit = models.DecimalField(editable=False, max_digits=15, decimal_places=2)
    profit_margin = models.DecimalField(editable=False, max_digits=15, decimal_places=2)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='buyer_profitability_set',
    )

    class Meta:
        db_table = 'buyer_profitability'
        verbose_name = 'BuyerProfitability'
        verbose_name_plural = 'BuyerProfitabiliies'


class OrderAmendmentHistory(models.Model):
    purchase_order = models.IntegerField()
    amendment_date = models.DateField()
    previous_value = models.CharField(max_length=255)
    new_value = models.CharField(max_length=255)
    reason = models.CharField(max_length=255)
    amended_by = models.CharField(max_length=255, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='order_amendment_history_set',
    )

    class Meta:
        db_table = 'order_amendment_history'
        verbose_name = 'OrderAmendmentHistory'
        verbose_name_plural = 'OrderAmendmentHistoies'

