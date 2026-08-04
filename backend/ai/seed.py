import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from django.contrib.auth import get_user_model

from core.models import Organization
from ai.models import ConversationLog, MessageLog

User = get_user_model()

print("Seeding ai data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

user, created = User.objects.get_or_create(email="admin@texon.com", defaults={"is_staff": True})
if created:
    user.set_password("admin123")
    user.save()

# ── Conversation Logs ───────────────────────────────────────────────────────
conversations = []
for conv_id in [
    "conv-2025-0001", "conv-2025-0002", "conv-2025-0003",
    "conv-2025-0004", "conv-2025-0005", "conv-2025-0006",
]:
    c, _ = ConversationLog.objects.get_or_create(conversation_id=conv_id, defaults={"user": user})
    conversations.append(c)

# ── Message Logs ────────────────────────────────────────────────────────────
for conv_i, role, content in [
    # ── conv-2025-0001: shipment tracking ──
    (0, "user", "How many shipments are currently in transit to Rotterdam?"),
    (0, "assistant", "There is 1 shipment in transit to Rotterdam: SHP-2415 (MSCU7291035) with ETA 2024-11-02."),
    (0, "user", "Which forwarder is handling it?"),
    (0, "assistant", "SHP-2415 is being handled by Flexport with carrier MSC. Clearance status is pending."),
    # ── conv-2025-0002: order status ──
    (1, "user", "What is the current status of PO-2401?"),
    (1, "assistant", "PO-2401 (Basic Tee, H&M) is in production. Quantity 8,200 pcs, delivery due 2024-10-25."),
    (1, "user", "Is it on track for the delivery date?"),
    (1, "assistant", "Yes. Cutting is 100% complete and sewing is 65% done, which is ahead of the TNA calendar."),
    # ── conv-2025-0003: production output ──
    (2, "user", "Show production output for Line-1 today"),
    (2, "assistant", "Line-1 produced 620 pieces today against a target of 650 (95.4% efficiency)."),
    (2, "user", "What caused the shortfall?"),
    (2, "assistant", "There was a 45-minute machine breakdown on operation 12 (overlock). Issue has been resolved."),
    # ── conv-2025-0004: LCs ──
    (3, "user", "Which LCs are pending realization?"),
    (3, "assistant", "2 LCs are pending: RLZ-2408 (expected 196,800 USD) and RLZ-2388 (expected 54,980 USD)."),
    (3, "user", "Any overdue realizations?"),
    (3, "assistant", "Yes: RLZ-2412 had a short realization of 6,280 USD due to quality deduction."),
    # ── conv-2025-0005: receivables ──
    (4, "user", "Summarize accounts receivable aging"),
    (4, "assistant", "Total AR is 313,340 USD overdue/pending across 4 invoices; largest is AR-INV-2404 (196,800 USD, overdue)."),
    (4, "user", "Which buyer owes the most?"),
    (4, "assistant", "Levi Strauss & Co. owes the most: 251,780 USD across 2 invoices."),
    # ── conv-2025-0006: fabric delivery ──
    (5, "user", "When is the next fabric delivery for STY-001?"),
    (5, "assistant", "The next fabric delivery is scheduled for 2024-10-06 per the timeline milestone 'Fabric Received' for PO-2401."),
    (5, "user", "Is the fabric supplier performing on time?"),
    (5, "assistant", "Yes. Envoy Textiles has delivered 100% of bookings on time over the last 3 months."),
]:
    conv = conversations[conv_i]
    MessageLog.objects.get_or_create(
        conversation=conv, role=role, content=content,
        defaults={"tool_call_id": "", "tool_name": ""},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [(ConversationLog, "Conversations"), (MessageLog, "Messages")]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
