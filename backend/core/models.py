from django.db import models


class Location(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Location"
        verbose_name_plural = "Locations"

    def __str__(self):
        return self.name


class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=5, blank=True)
    exchange_rate = models.DecimalField(max_digits=12, decimal_places=6, default=1.0)
    is_base = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Currency"
        verbose_name_plural = "Currencys"

    def __str__(self):
        return f"{self.code} - {self.name}"


class OutboxCommand(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CLAIMED = "CLAIMED", "Claimed"
        RETRY_WAIT = "RETRY_WAIT", "Retry Wait"
        OUTCOME_UNKNOWN = "OUTCOME_UNKNOWN", "Outcome Unknown"
        REJECTED = "REJECTED", "Rejected"
        SUCCEEDED = "SUCCEEDED", "Succeeded"
        DEAD_LETTER = "DEAD_LETTER", "Dead Letter"

    operation_uuid = models.UUIDField(unique=True, db_index=True)
    fingerprint = models.CharField(max_length=64, db_index=True)
    tenant_id = models.CharField(max_length=128, db_index=True)
    company_id = models.BigIntegerField(db_index=True)
    actor_id = models.CharField(max_length=128)
    command_name = models.CharField(max_length=128, db_index=True)
    schema_version = models.PositiveIntegerField(default=1)
    aggregate_id = models.CharField(max_length=128, db_index=True)
    expected_revision = models.BigIntegerField(null=True, blank=True)
    payload_json = models.TextField()

    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    attempt_count = models.PositiveIntegerField(default=0)
    max_attempts = models.PositiveIntegerField(default=5)
    next_attempt_at = models.DateTimeField(db_index=True)

    lease_token = models.UUIDField(null=True, blank=True, db_index=True)
    lease_expires_at = models.DateTimeField(null=True, blank=True, db_index=True)

    response_data = models.JSONField(null=True, blank=True)
    error_code = models.CharField(max_length=64, blank=True)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]
        verbose_name = "Outbox Command"
        verbose_name_plural = "Outbox Commands"
        indexes = [
            models.Index(fields=["status", "next_attempt_at"], name="outbox_status_next_idx"),
            models.Index(fields=["status", "lease_expires_at"], name="outbox_status_lease_idx"),
            models.Index(fields=["aggregate_id", "status"], name="outbox_agg_status_idx"),
        ]

    def __str__(self):
        return f"{self.command_name} ({self.operation_uuid}) - {self.status}"
