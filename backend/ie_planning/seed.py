import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from buyers.models import Buyer
from merchandising.models import Style, PurchaseOrder
from ie_planning.models import (
    CapacityBooking, LinePlan, ProductionPlan, RiskAssessment, StyleAnalysis,
)

print("Seeding ie_planning data...")

buyer, _ = Buyer.objects.get_or_create(code="HM", defaults={"name": "H&M Group", "country": "Sweden"})

styles = []
for name, snum in [
    ("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"),
    ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"),
]:
    s, _ = Style.objects.get_or_create(style_number=snum, defaults={"name": name, "buyer": buyer})
    styles.append(s)

orders = []
for i, (po_num, qty, unit, total, st) in enumerate([
    ("PO-2401", 8200, "4.20", "34440.00", "in_production"),
    ("PO-2402", 5600, "5.80", "32480.00", "in_production"),
    ("PO-2403", 10400, "3.95", "41080.00", "confirmed"),
    ("PO-2404", 7300, "6.40", "46720.00", "confirmed"),
]):
    o, _ = PurchaseOrder.objects.get_or_create(
        po_number=po_num,
        defaults={"buyer": buyer, "style": styles[i], "order_date": date(2024, 8, 15) + timedelta(days=i * 10),
                  "delivery_date": date(2024, 10, 25) + timedelta(days=i * 10), "quantity": qty,
                  "unit_price": Decimal(unit), "total_value": Decimal(total), "status": st},
    )
    orders.append(o)

# ── Capacity Bookings ───────────────────────────────────────────────────────
for style_i, line, cap, days, bdate, st in [
    (0, "Line-1", 650, 12, "2024-09-01", "allocated"),
    (0, "Line-2", 650, 10, "2024-09-05", "in_use"),
    (1, "Line-1", 550, 14, "2024-09-08", "allocated"),
    (1, "Line-3", 500, 9, "2024-09-10", "in_use"),
    (2, "Line-2", 700, 15, "2024-09-12", "allocated"),
    (2, "Line-4", 600, 11, "2024-09-15", "in_use"),
    (3, "Line-3", 520, 13, "2024-09-18", "allocated"),
    (0, "Line-5", 480, 8, "2024-09-20", "released"),
    (1, "Line-4", 620, 12, "2024-09-22", "in_use"),
    (2, "Line-6", 450, 10, "2024-09-25", "allocated"),
]:
    CapacityBooking.objects.get_or_create(
        style=styles[style_i], line=line, booking_date=date.fromisoformat(bdate),
        defaults={"capacity_per_day": cap, "allocated_days": days, "status": st,
                  "notes": "IE capacity booking for sewing floor"},
    )

# ── Line Plans ──────────────────────────────────────────────────────────────
for style_i, line, pdate, target, st in [
    (0, "Line-1", "2024-10-01", 650, "running"),
    (0, "Line-2", "2024-10-01", 650, "completed"),
    (1, "Line-1", "2024-10-05", 550, "planned"),
    (1, "Line-3", "2024-10-05", 500, "running"),
    (2, "Line-2", "2024-10-08", 700, "planned"),
    (2, "Line-4", "2024-10-08", 600, "planned"),
    (3, "Line-3", "2024-10-12", 520, "running"),
    (0, "Line-5", "2024-10-15", 480, "planned"),
    (1, "Line-4", "2024-10-15", 620, "planned"),
    (2, "Line-6", "2024-10-20", 450, "completed"),
]:
    LinePlan.objects.get_or_create(
        style=styles[style_i], line=line, plan_date=date.fromisoformat(pdate),
        defaults={"target_quantity": target, "status": st,
                  "notes": "Daily line plan issued by IE department"},
    )

# ── Production Plans ────────────────────────────────────────────────────────
for i, (po, sdate, edate, target, st) in enumerate([
    (0, "2024-09-05", "2024-10-05", 820, "approved"),
    (1, "2024-09-12", "2024-10-08", 700, "approved"),
    (2, "2024-09-20", "2024-10-25", 1040, "in_progress"),
    (3, "2024-09-25", "2024-10-22", 730, "draft"),
]):
    ProductionPlan.objects.get_or_create(
        purchase_order=orders[i], style=orders[i].style,
        defaults={"planned_start_date": date.fromisoformat(sdate), "planned_end_date": date.fromisoformat(edate),
                  "daily_target": target, "total_quantity": orders[i].quantity, "status": st,
                  "notes": f"Production plan for {orders[i].po_number}"},
    )

# ── Risk Assessments ────────────────────────────────────────────────────────
for style_i, risk, sev, lik, mit, st in [
    (0, "Fabric Late Delivery", "high", "high", "Book backup stock with Envoy Textiles Ltd", "open"),
    (1, "Capacity Shortage", "medium", "medium", "Shift production to Line-3 and Line-4", "mitigated"),
    (2, "QC Failure", "high", "medium", "Strengthen inline inspection with QA team", "open"),
    (3, "Machine Breakdown", "medium", "low", "Maintain spare parts and AMC contract", "mitigated"),
    (0, "Labor Shortage", "medium", "high", "Hire 20 temporary operators for peak season", "open"),
    (1, "Utility Disruption", "low", "medium", "Install backup generator for sewing floor", "closed"),
]:
    RiskAssessment.objects.get_or_create(
        style=styles[style_i], risk_type=risk, severity=sev, likelihood=lik,
        defaults={"mitigation_plan": mit, "status": st},
    )

# ── Style Analyses ──────────────────────────────────────────────────────────
for style_i, atype, findings, rec, adate in [
    (0, "cost", "Fabric cost 18% above budget due to cotton price hike",
     "Re-negotiate price with Envoy Textiles Ltd", "2024-08-20"),
    (1, "feasibility", "Feasible on existing lines with 2.1 SMV",
     "Proceed with production plan", "2024-08-22"),
    (2, "market", "High demand in EU market for denim jackets",
     "Increase capacity allocation for Q4", "2024-08-25"),
    (3, "production", "Production analysis shows 12% efficiency gap",
     "Improve line balancing across Line-3", "2024-08-28"),
    (0, "production", "Output per machine 15% below standard",
     "Conduct operator training program", "2024-09-02"),
    (1, "cost", "Trim cost reduced 8% with local sourcing",
     "Continue local sourcing strategy", "2024-09-05"),
]:
    StyleAnalysis.objects.get_or_create(
        style=styles[style_i], analysis_type=atype,
        defaults={"findings": findings, "recommendation": rec,
                  "analyzed_by": "IE Analyst", "analysis_date": date.fromisoformat(adate)},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [
    (CapacityBooking, "Capacity Bookings"), (LinePlan, "Line Plans"),
    (ProductionPlan, "Production Plans"), (RiskAssessment, "Risk Assessments"),
    (StyleAnalysis, "Style Analyses"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
