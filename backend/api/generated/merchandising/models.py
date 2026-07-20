from django.db import models
from django.conf import settings

class BuyerEnquiry(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='buyer_enquiry_set',
    )
    buyer = models.IntegerField()
    style = models.IntegerField(null=True, blank=True)
    enquiry_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('received', 'Received'), ('under_review', 'Under Review'), ('quoted', 'Quoted'), ('converted', 'Converted'), ('lost', 'Lost')])
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'buyer_enquiry'
        verbose_name = 'BuyerEnquiry'
        verbose_name_plural = 'BuyerEnquiies'


class DevelopmentMonitoring(models.Model):
    style = models.IntegerField()
    supplier = models.CharField(max_length=255)
    stage = models.CharField(max_length=100)
    start_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed')])
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='development_monitoring_set',
    )

    class Meta:
        db_table = 'development_monitoring'
        verbose_name = 'DevelopmentMonitoring'
        verbose_name_plural = 'DevelopmentMonitorings'


class SMVRecord(models.Model):
    style = models.IntegerField()
    smv = models.DecimalField(max_digits=15, decimal_places=2)
    calculated_by = models.CharField(max_length=255)
    calculation_date = models.DateField()
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='smv_record_set',
    )

    class Meta:
        db_table = 'smv_record'
        verbose_name = 'SMVRecord'
        verbose_name_plural = 'SMVRecords'


class Style(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='style_set',
    )
    buyer = models.IntegerField()
    name = models.CharField(max_length=255)
    style_number = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'style'
        verbose_name = 'Style'
        verbose_name_plural = 'Styles'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class StyleAnalysis(models.Model):
    style = models.IntegerField()
    analysis_type = models.CharField(max_length=50, choices=[('cost', 'Cost'), ('feasibility', 'Feasibility'), ('market', 'Market'), ('production', 'Production')])
    findings = models.CharField(max_length=255)
    recommendation = models.CharField(max_length=255)
    analyzed_by = models.CharField(max_length=255)
    analysis_date = models.DateField()
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='style_analysis_set',
    )

    class Meta:
        db_table = 'style_analysis'
        verbose_name = 'StyleAnalysis'
        verbose_name_plural = 'StyleAnalysiss'

