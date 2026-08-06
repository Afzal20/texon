import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from reporting.models import Report, Dashboard

print("Seeding reporting data...")

# ── Reports ─────────────────────────────────────────────────────────────────
for title, rtype, params, by, st, notes in [
    ("Monthly MIS Report - Sep 2024", "mis", {"from": "2024-09-01", "to": "2024-09-30"},
     "MIS Department", "ready", "Consolidated factory MIS report"),
    ("Production Output Report", "production", {"from": "2024-09-01", "to": "2024-09-30", "line": "Line-1"},
     "Production Planning", "ready", "Daily output vs target by line"),
    ("Line Efficiency Report", "efficiency", {"from": "2024-09-01", "to": "2024-09-30", "line": "All"},
     "IE Department", "ready", "Efficiency by line and style"),
    ("Quality Rejection Report", "quality", {"from": "2024-09-01", "to": "2024-09-30", "floor": "Floor 1"},
     "Quality Assurance", "ready", "Rejection rate by operation"),
    ("Financial Statement Summary", "financial", {"from": "2024-01-01", "to": "2024-09-30"},
     "Finance Department", "ready", "P&L and balance sheet summary"),
    ("Inventory Stock Report", "inventory", {"from": "2024-09-01", "to": "2024-09-30", "category": "Fabric"},
     "Store In-charge", "ready", "Fabric stock position and aging"),
    ("HR Attendance Summary", "hr", {"from": "2024-09-01", "to": "2024-09-30"},
     "HR Department", "generating", "Attendance and OT summary"),
    ("Buyer-wise Shipment Report", "custom", {"from": "2024-01-01", "to": "2024-09-30", "buyer": "HM"},
     "Commercial Department", "failed", "Insufficient data for chart export"),
]:
    Report.objects.get_or_create(
        title=title,
        defaults={"report_type": rtype, "parameters": params, "generated_by": by,
                  "status": st, "notes": notes},
    )

# ── Dashboards ──────────────────────────────────────────────────────────────
for name, dtype, config, is_default, by in [
    ("Management Dashboard", "management",
     {"widgets": ["revenue_trend", "order_pipeline", "capacity_utilization", "top_buyers"]}, True, "MIS Manager"),
    ("Production Dashboard", "production",
     {"widgets": ["line_output", "efficiency_gauge", "target_vs_actual"]}, False, "Production Manager"),
    ("Quality Dashboard", "quality",
     {"widgets": ["defect_rate", "inspection_summary", "rejection_by_floor"]}, False, "Quality Manager"),
    ("Financial Dashboard", "financial",
     {"widgets": ["cash_flow", "receivables_aging", "payables_aging"]}, False, "Finance Manager"),
]:
    Dashboard.objects.get_or_create(
        name=name,
        defaults={"dashboard_type": dtype, "config": config, "is_default": is_default, "created_by": by},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [(Report, "Reports"), (Dashboard, "Dashboards")]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
