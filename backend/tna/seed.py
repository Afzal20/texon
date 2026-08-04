import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from datetime import datetime

from django.utils import timezone

from core.models import Organization
from buyers.models import Buyer
from merchandising.models import Style, PurchaseOrder
from tna.models import Task, JobOrder, Timeline, AlarmNotification

print("Seeding tna data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

buyer, _ = Buyer.objects.get_or_create(organization=org, code="HM", defaults={"name": "H&M Group", "country": "Sweden"})

styles = []
for name, snum in [
    ("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"),
    ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"),
]:
    s, _ = Style.objects.get_or_create(organization=org, style_number=snum, defaults={"name": name, "buyer": buyer})
    styles.append(s)

orders = []
for i, (po_num, qty, unit, total, st) in enumerate([
    ("PO-2401", 8200, "4.20", "34440.00", "in_production"),
    ("PO-2402", 5600, "5.80", "32480.00", "in_production"),
    ("PO-2403", 10400, "3.95", "41080.00", "confirmed"),
    ("PO-2404", 7300, "6.40", "46720.00", "confirmed"),
]):
    o, _ = PurchaseOrder.objects.get_or_create(
        organization=org, po_number=po_num,
        defaults={"buyer": buyer, "style": styles[i], "order_date": date(2024, 8, 15) + timedelta(days=i * 10),
                  "delivery_date": date(2024, 10, 25) + timedelta(days=i * 10), "quantity": qty,
                  "unit_price": Decimal(unit), "total_value": Decimal(total), "status": st},
    )
    orders.append(o)

# ── Tasks ───────────────────────────────────────────────────────────────────
tasks = []
for i, po in enumerate(orders):
    start = date(2024, 9, 1) + timedelta(days=i * 12)
    root, _ = Task.objects.get_or_create(
        organization=org, title=f"TNA Monitoring - {po.po_number}", purchase_order=po,
        style=po.style, parent_task=None,
        defaults={"description": f"Overall TNA monitoring for {po.po_number}",
                  "assigned_to": "Merchandiser Rafi", "start_date": start,
                  "end_date": start + timedelta(days=30), "duration_days": 30,
                  "priority": "high", "status": "in_progress", "progress": random.randint(40, 70),
                  "notes": "Tracked against buyer milestone calendar"},
    )
    tasks.append(root)
    for j, (title, dur, prio, st, prog) in enumerate([
        ("Fabric Booking", 3, "critical", "completed", 100),
        ("Cutting", 5, "high", "completed", 100),
        ("Sewing", 5, "high", "in_progress", 65),
        ("Finishing", 3, "medium", "in_progress", 40),
        ("Packing", 2, "medium", "not_started", 0),
    ]):
        t, _ = Task.objects.get_or_create(
            organization=org, title=title, purchase_order=po, style=po.style, parent_task=root,
            defaults={"description": f"{title} milestone for {po.po_number}",
                      "assigned_to": random.choice(["Rafi (Merchandising)", "Imran (Cutting)", "Sabbir (Sewing)", "Nazmul (Finishing)", "Amin (Packing)"]),
                      "start_date": start + timedelta(days=j * 5),
                      "end_date": start + timedelta(days=j * 5 + dur),
                      "duration_days": dur, "priority": prio, "status": st, "progress": prog,
                      "notes": "Milestone task in TNA tree"},
        )
        tasks.append(t)

# ── Job Orders ──────────────────────────────────────────────────────────────
children = [t for t in tasks if t.parent_task is not None]
for idx, task in enumerate(children):
    po_i = idx // 5
    j = idx % 5
    JobOrder.objects.get_or_create(
        organization=org, job_order_number=f"JO-24{po_i + 1:02d}-{j + 1:02d}",
        defaults={"task": task, "description": f"Job order for {task.title} on {task.purchase_order.po_number}",
                  "assigned_department": random.choice(["Cutting", "Sewing", "Finishing", "Packing", "Merchandising"]),
                  "assigned_person": task.assigned_to, "start_date": task.start_date, "end_date": task.end_date,
                  "status": "completed" if task.status == "completed" else "in_progress",
                  "notes": "Generated from TNA task"},
    )

# ── Timeline ────────────────────────────────────────────────────────────────
for i, po in enumerate(orders):
    start = date(2024, 9, 1) + timedelta(days=i * 12)
    for k, (milestone, day_off, st, actual) in enumerate([
        ("Fabric Booking", 0, "completed", 0),
        ("Fabric Received", 5, "completed", 6),
        ("Cutting Start", 10, "completed", 10),
        ("Sewing Start", 15, "on_track", None),
        ("Finishing Start", 20, "on_track", None),
        ("Inspection", 24, "pending", None),
        ("Packing", 26, "pending", None),
        ("Shipment", 30, "pending", None),
    ]):
        Timeline.objects.get_or_create(
            organization=org, purchase_order=po, style=po.style, milestone=milestone,
            defaults={"planned_date": start + timedelta(days=day_off),
                      "actual_date": start + timedelta(days=actual) if actual is not None else None,
                      "status": st, "notes": "Timeline milestone per buyer calendar"},
        )

# ── Alarm Notifications ─────────────────────────────────────────────────────
for task_i, atype, recipient, ahead, st in [
    (0, "email", "merchandiser@texon.com", 2, "sent"),
    (1, "sms", "+8801711-000001", 3, "sent"),
    (2, "in_app", "ie_manager", 1, "sent"),
    (4, "email", "planning@texon.com", 4, "sent"),
    (6, "sms", "+8801711-000002", 2, "scheduled"),
    (8, "in_app", "production_manager", 5, "scheduled"),
    (10, "email", "quality@texon.com", 2, "scheduled"),
    (12, "sms", "+8801711-000003", 1, "scheduled"),
]:
    task = children[task_i]
    scheduled_at = timezone.make_aware(datetime.combine(task.end_date - timedelta(days=ahead), datetime.min.time()))
    AlarmNotification.objects.get_or_create(
        organization=org, task=task, alarm_type=atype, recipient=recipient,
        defaults={"message": f"Reminder: {task.title} for {task.purchase_order.po_number} is due soon",
                  "scheduled_at": scheduled_at,
                  "sent_at": scheduled_at if st == "sent" else None, "status": st},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [
    (Task, "Tasks"), (JobOrder, "Job Orders"), (Timeline, "Timelines"), (AlarmNotification, "Alarms"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
