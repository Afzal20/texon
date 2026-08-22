from django.db import models
from core.models import Currency
from buyers.models import Buyer
from procurement.models import Supplier


class Shipment(models.Model):
    shipment_number = models.CharField(max_length=100)
    buyer = models.ForeignKey(
        Buyer, on_delete=models.SET_NULL, null=True, blank=True, related_name="commercial_shipments"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="commercial_shipments"
    )
    direction = models.CharField(
        max_length=20,
        choices=[("import", "Import"), ("export", "Export")],
        default="import",
    )
    shipment_type = models.CharField(
        max_length=50,
        choices=[("sea", "Sea"), ("air", "Air"), ("land", "Land"), ("rail", "Rail")],
        default="sea",
    )
    port_of_loading = models.CharField(max_length=255, blank=True)
    port_of_discharge = models.CharField(max_length=255, blank=True)
    container_number = models.CharField(max_length=100, blank=True)
    container_size = models.CharField(
        max_length=20,
        choices=[("20ft", "20ft"), ("40ft", "40ft"), ("40hq", "40HQ")],
        default="40ft",
    )
    forwarder = models.CharField(max_length=255, blank=True)
    vessel_name = models.CharField(max_length=255, blank=True)
    carrier = models.CharField(max_length=255, blank=True)
    booking_number = models.CharField(max_length=100, blank=True)
    purchase_order = models.ForeignKey(
        "orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="shipments"
    )
    shipment_date = models.DateField(null=True, blank=True)
    etd = models.DateField(null=True, blank=True, verbose_name="Estimated Time of Departure")
    eta = models.DateField(null=True, blank=True, verbose_name="Estimated Time of Arrival")
    actual_arrival = models.DateField(null=True, blank=True)
    gross_weight = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    net_weight = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    volume_cbm = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("booked", "Booked"),
            ("loaded", "Loaded"),
            ("shipped", "Shipped"),
            ("in_transit", "In Transit"),
            ("arrived", "Arrived"),
            ("cleared", "Cleared"),
            ("delivered", "Delivered"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    clearance_status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("cleared", "Cleared"),
            ("on_hold", "On Hold"),
        ],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Shipment"
        verbose_name_plural = "Shipments"
        unique_together = ("shipment_number",)

    def __str__(self):
        return f"{self.shipment_number} - {self.direction}"


class LetterOfCredit(models.Model):
    lc_number = models.CharField(max_length=100)
    lc_type = models.CharField(
        max_length=20,
        choices=[
            ("import", "Import LC"),
            ("export", "Export LC"),
            ("btb", "Back-to-Back LC"),
        ],
        default="import",
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.SET_NULL, null=True, blank=True, related_name="lcs"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="lcs"
    )
    parent_lc = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="child_lcs"
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    bank_name = models.CharField(max_length=255, blank=True)
    bank_reference = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("issued", "Issued"),
            ("amended", "Amended"),
            ("extended", "Extended"),
            ("utilized", "Utilized"),
            ("expired", "Expired"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    amendment_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "LetterOfCredit"
        verbose_name_plural = "LetterOfCredits"
        unique_together = ("lc_number",)

    def __str__(self):
        return f"{self.lc_number} - {self.lc_type}"


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=100)
    buyer = models.ForeignKey(
        Buyer, on_delete=models.SET_NULL, null=True, blank=True, related_name="commercial_invoices"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="commercial_invoices"
    )
    purchase_order = models.ForeignKey(
        "orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="commercial_invoices"
    )
    lc = models.ForeignKey(
        LetterOfCredit, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices"
    )
    invoice_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    invoice_type = models.CharField(
        max_length=50,
        choices=[
            ("commercial", "Commercial Invoice"),
            ("proforma", "Proforma Invoice"),
            ("credit_note", "Credit Note"),
            ("debit_note", "Debit Note"),
        ],
        default="commercial",
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("submitted", "Submitted"),
            ("approved", "Approved"),
            ("paid", "Paid"),
            ("partial", "Partially Paid"),
            ("overdue", "Overdue"),
            ("cancelled", "Cancelled"),
        ],
        default="draft",
    )
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        unique_together = ("invoice_number",)

    def __str__(self):
        return f"{self.invoice_number} - {self.amount}"


class BillOfExchange(models.Model):
    bill_number = models.CharField(max_length=100)
    lc = models.ForeignKey(
        LetterOfCredit, on_delete=models.SET_NULL, null=True, blank=True, related_name="bills_of_exchange"
    )
    buyer = models.ForeignKey(
        Buyer, on_delete=models.SET_NULL, null=True, blank=True, related_name="bills_of_exchange"
    )
    bank_name = models.CharField(max_length=255, blank=True)
    bank_reference = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    issue_date = models.DateField(null=True, blank=True)
    maturity_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("submitted", "Submitted"),
            ("under_review", "Under Review"),
            ("accepted", "Accepted"),
            ("negotiated", "Negotiated"),
            ("paid", "Paid"),
            ("rejected", "Rejected"),
        ],
        default="draft",
    )
    documents_required = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "BillOfExchange"
        verbose_name_plural = "BillOfExchanges"
        unique_together = ("bill_number",)

    def __str__(self):
        return f"{self.bill_number} - {self.amount}"


class SupplierDocument(models.Model):
    document_number = models.CharField(max_length=100)
    supplier = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, related_name="documents"
    )
    shipment = models.ForeignKey(
        Shipment, on_delete=models.SET_NULL, null=True, blank=True, related_name="supplier_documents"
    )
    purchase_order = models.ForeignKey(
        "orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="supplier_documents"
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ("bill_of_lading", "Bill of Lading"),
            ("commercial_invoice", "Commercial Invoice"),
            ("packing_list", "Packing List"),
            ("certificate_of_origin", "Certificate of Origin"),
            ("inspection_report", "Inspection Report"),
            ("insurance", "Insurance Certificate"),
            ("other", "Other"),
        ],
    )
    received_date = models.DateField(null=True, blank=True)
    reviewed_by = models.CharField(max_length=255, blank=True)
    review_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending Review"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
            ("resubmitted", "Resubmitted"),
        ],
        default="pending",
    )
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "SupplierDocument"
        verbose_name_plural = "SupplierDocuments"
        unique_together = ("document_number",)

    def __str__(self):
        return f"{self.document_number} - {self.supplier.name}"


class Realization(models.Model):
    realization_number = models.CharField(max_length=100)
    buyer = models.ForeignKey(
        Buyer, on_delete=models.CASCADE, related_name="realizations"
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="realizations"
    )
    expected_amount = models.DecimalField(max_digits=15, decimal_places=2)
    realized_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    realization_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("expected", "Expected"),
            ("realized", "Realized"),
            ("overdue", "Overdue"),
            ("partial", "Partially Realized"),
            ("short", "Short Realization"),
        ],
        default="expected",
    )
    short_reason = models.CharField(
        max_length=100,
        blank=True,
        choices=[
            ("", ""),
            ("quality_deduction", "Quality Deduction"),
            ("rate_dispute", "Rate Dispute"),
            ("quantity_variance", "Quantity Variance"),
            ("delay_penalty", "Delayed Delivery Penalty"),
            ("damage_deduction", "Damage Deduction"),
            ("other", "Other"),
        ],
    )
    short_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Realization"
        verbose_name_plural = "Realizations"
        unique_together = ("realization_number",)

    def __str__(self):
        return f"{self.realization_number} - {self.realized_amount}/{self.expected_amount}"


class SODFCTransfer(models.Model):
    transfer_number = models.CharField(max_length=100)
    transfer_type = models.CharField(
        max_length=20,
        choices=[
            ("sod", "SOD Transfer"),
            ("fc", "FC Transfer"),
        ],
        default="fc",
    )
    bank_name = models.CharField(max_length=255, blank=True)
    bank_reference = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    transfer_date = models.DateField(null=True, blank=True)
    acknowledged_by = models.CharField(max_length=255, blank=True)
    acknowledgment_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending Acknowledgement"),
            ("acknowledged", "Acknowledged"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "SODFCTransfer"
        verbose_name_plural = "SODFCTransfers"
        unique_together = ("transfer_number",)

    def __str__(self):
        return f"{self.transfer_number} - {self.transfer_type}"


class Disbursement(models.Model):
    disbursement_number = models.CharField(max_length=100)
    category = models.CharField(
        max_length=100,
        choices=[
            ("material_purchase", "Material Purchase"),
            ("freight_charges", "Freight Charges"),
            ("customs_duty", "Customs Duty"),
            ("supplier_payment", "Supplier Payment"),
            ("bank_charges", "Bank Charges"),
            ("insurance", "Insurance"),
            ("other", "Other"),
        ],
    )
    purchase_order = models.ForeignKey(
        "orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="disbursements"
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="disbursements"
    )
    shipment = models.ForeignKey(
        Shipment, on_delete=models.SET_NULL, null=True, blank=True, related_name="disbursements"
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, null=True, blank=True
    )
    disbursement_date = models.DateField(null=True, blank=True)
    approved_by = models.CharField(max_length=255, blank=True)
    approval_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("draft", "Draft"),
            ("pending_approval", "Pending Approval"),
            ("approved", "Approved"),
            ("disbursed", "Disbursed"),
            ("rejected", "Rejected"),
        ],
        default="draft",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Disbursement"
        verbose_name_plural = "Disbursements"
        unique_together = ("disbursement_number",)

    def __str__(self):
        return f"{self.disbursement_number} - {self.amount}"
