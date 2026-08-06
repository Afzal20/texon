import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from buyers.models import Buyer
from production.models import ProductionLine
from merchandising.models import (
    Style, BuyerEnquiry, PurchaseOrder, SampleOrder, SMVRecord,
    DevelopmentMonitoring, BudgetDemandAssessment, IeSuggestion,
    SkillInventory, ProductionDowntime, ProcessWiseTarget,
)

print("Seeding merchandising data...")

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
    ("Nike Inc.", "NKE", "USA"), ("Adidas AG", "ADI", "Germany"),
]:
    b, _ = Buyer.objects.get_or_create(code=code, defaults={"name": name, "country": country})
    buyers.append(b)

styles = []
for name, snum in [("Basic Tee", "STY-001"), ("Classic Polo", "STY-002"), ("Denim Jacket", "STY-003"), ("Chino Pants", "STY-004"), ("Hoodie", "STY-005"), ("Track Pants", "STY-006")]:
    s, _ = Style.objects.get_or_create(
        style_number=snum,
        defaults={"name": name, "buyer": buyers[0], "description": "Regular fit, medium weight", "category": "Knitwear"},
    )
    styles.append(s)

lines = []
for name, code, loc, cap in [
    ("Line-1", "LN-01", "Unit-1, Floor-3", 500), ("Line-2", "LN-02", "Unit-1, Floor-3", 450),
]:
    l, _ = ProductionLine.objects.get_or_create(
        code=code, defaults={"name": name, "location": loc, "capacity": cap}
    )
    lines.append(l)

def bi(i): return buyers[i % len(buyers)]
def si(i): return styles[i % len(styles)]

# ── Buyer Enquiries ──────────────────────────────────────────────────────────
for i, (buyer_i, style_i, enq_date, status, note) in enumerate([
    (0, 0, "2024-08-01", "converted", "Summer knitwear range, 4 colors"),
    (1, 1, "2024-08-03", "converted", "Polo range for Spring 2025"),
    (2, 2, "2024-08-05", "quoted", "Denim capsule collection"),
    (3, 3, "2024-08-07", "under_review", "Chino repeat order"),
    (4, 4, "2024-08-10", "quoted", "Fleece hoodies for Q4"),
    (5, 5, "2024-08-12", "received", "Track pants trial order"),
    (0, 3, "2024-08-15", "lost", "Price too high for winter"),
    (1, 0, "2024-08-18", "converted", "Extra white tees for fast-moving sizes"),
    (2, 4, "2024-08-20", "quoted", "Zip hoodies with kangaroo pocket"),
    (3, 2, "2024-08-22", "received", "Denim jacket with fake fur collar"),
]):
    BuyerEnquiry.objects.get_or_create(
        buyer=bi(buyer_i), style=si(style_i), enquiry_date=date.fromisoformat(enq_date),
        defaults={"status": status, "notes": note},
    )

# ── Purchase Orders ──────────────────────────────────────────────────────────
for i, (buyer_i, style_i, po_num, order_date, delivery_date, qty, price, status, note) in enumerate([
    (0, 0, "PO-24001", "2024-08-20", "2024-10-15", 15000, "2.85", "in_production", "Basic tee, 5 colors"),
    (1, 1, "PO-24002", "2024-08-22", "2024-10-20", 8000, "3.50", "confirmed", "Classic polo, 4 colors"),
    (2, 2, "PO-24003", "2024-08-25", "2024-11-01", 6000, "8.75", "confirmed", "Denim jacket, 2 washes"),
    (3, 3, "PO-24004", "2024-08-28", "2024-11-10", 12000, "5.20", "shipped", "Chino pants, 3 colors"),
    (4, 4, "PO-24005", "2024-09-01", "2024-11-20", 10000, "6.40", "in_production", "Hoodie, brushed back fleece"),
    (5, 5, "PO-24006", "2024-09-05", "2024-11-25", 7000, "4.80", "draft", "Track pants with drawstring"),
    (0, 3, "PO-24007", "2024-09-08", "2024-12-01", 20000, "5.10", "confirmed", "Repeat chino order, 4 colors"),
    (1, 0, "PO-24008", "2024-09-10", "2024-12-05", 18000, "2.90", "in_production", "Extra white tees"),
    (2, 4, "PO-24009", "2024-09-12", "2024-12-10", 5000, "7.20", "confirmed", "Zip hoodies"),
    (3, 2, "PO-24010", "2024-09-15", "2024-12-15", 4000, "9.30", "cancelled", "Cancelled by buyer"),
]):
    po, _ = PurchaseOrder.objects.get_or_create(
        po_number=po_num,
        defaults={"buyer": bi(buyer_i), "style": si(style_i), "order_date": date.fromisoformat(order_date),
                  "delivery_date": date.fromisoformat(delivery_date), "quantity": qty,
                  "unit_price": Decimal(price), "total_value": Decimal(str(round(qty * float(price), 2))),
                  "status": status, "notes": note},
    )

# ── Sample Orders ────────────────────────────────────────────────────────────
for i, (buyer_i, style_i, sample_type, qty, req_date, deadline, status) in enumerate([
    (0, 0, "fit", 2, "2024-08-01", "2024-08-10", "approved"),
    (0, 0, "size_set", 12, "2024-08-05", "2024-08-20", "approved"),
    (1, 1, "pp", 3, "2024-08-08", "2024-08-22", "approved"),
    (2, 2, "photo", 2, "2024-08-12", "2024-08-25", "submitted"),
    (3, 3, "fit", 2, "2024-08-15", "2024-08-28", "in_progress"),
    (4, 4, "pre_production", 5, "2024-08-18", "2024-09-01", "in_progress"),
    (5, 5, "shipping", 3, "2024-08-20", "2024-09-05", "requested"),
    (1, 0, "photo", 2, "2024-08-22", "2024-09-08", "rejected"),
]):
    SampleOrder.objects.get_or_create(
        buyer=bi(buyer_i), style=si(style_i), sample_type=sample_type,
        request_date=date.fromisoformat(req_date),
        defaults={"quantity": qty, "deadline": date.fromisoformat(deadline), "status": status},
    )

# ── SMV Records ──────────────────────────────────────────────────────────────
for i, (style_i, smv, calc_date, note) in enumerate([
    (0, "12.50", "2024-07-01", "Flat lock hem"),
    (1, "15.80", "2024-07-03", "Collar and placket"),
    (2, "28.40", "2024-07-05", "Zip and pocket attachment"),
    (3, "18.20", "2024-07-08", "Slant pockets"),
    (4, "22.60", "2024-07-10", "Hood and drawstring"),
    (5, "16.90", "2024-07-12", "Side seam taping"),
    (0, "12.90", "2024-07-20", "Re-measured after line trial"),
    (3, "19.10", "2024-07-25", "Re-measured after method change"),
]):
    SMVRecord.objects.get_or_create(
        style=si(style_i), smv=Decimal(smv), calculation_date=date.fromisoformat(calc_date),
        defaults={"calculated_by": random.choice(["IE Dept", "Planning Dept", "Md. Karim"]), "notes": note},
    )

# ── Development Monitoring ───────────────────────────────────────────────────
for i, (style_i, supplier, stage, start, end, status, note) in enumerate([
    (0, "Envoy Textiles Ltd", "Fabric Development", "2024-06-01", "2024-06-20", "completed", "Shade card ready"),
    (0, "Envoy Textiles Ltd", "Sample Making", "2024-06-21", "2024-07-05", "completed", "Fit sample approved"),
    (1, "DBL Group", "Fabric Development", "2024-06-05", "2024-06-25", "completed", "Pique knit approved"),
    (2, "Fakir Knitwears", "Fabric Sourcing", "2024-06-10", "2024-07-01", "completed", "Denim 12oz booked"),
    (3, "Envoy Textiles Ltd", "Sample Making", "2024-06-15", "2024-07-05", "completed", "Size set in hand"),
    (4, "DBL Group", "Fabric Development", "2024-06-20", None, "in_progress", "Fleece brushing trial"),
    (5, "Fakir Knitwears", "Fabric Sourcing", "2024-06-25", None, "in_progress", "Awaiting lab dip"),
    (2, "DBL Group", "Garment Wash", "2024-07-01", None, "pending", "Wash test pending"),
]):
    DevelopmentMonitoring.objects.get_or_create(
        style=si(style_i), stage=stage, start_date=date.fromisoformat(start),
        defaults={"supplier": supplier, "completion_date": date.fromisoformat(end) if end else None,
                  "status": status, "notes": note},
    )

# ── Budget Demand Assessments ────────────────────────────────────────────────
for i, (buyer_i, asmt_date, forecast, booked, revenue, confidence) in enumerate([
    (0, "2024-08-01", 120000, 95000, 342000, "high"),
    (1, "2024-08-05", 80000, 45000, 240000, "high"),
    (2, "2024-08-10", 60000, 22000, 168000, "medium"),
    (3, "2024-08-15", 50000, 40000, 185000, "high"),
    (4, "2024-08-20", 90000, 35000, 275000, "medium"),
    (5, "2024-08-25", 40000, 8000, 95000, "low"),
]):
    BudgetDemandAssessment.objects.get_or_create(
        buyer=bi(buyer_i), assessment_date=date.fromisoformat(asmt_date),
        defaults={"forecast_quantity": forecast, "booked_quantity": booked,
                  "gap_quantity": forecast - booked, "revenue_estimate": Decimal(str(revenue)),
                  "confidence": confidence, "notes": "Annual buying plan review"},
    )

# ── IE Suggestions ───────────────────────────────────────────────────────────
for i, (line_i, style_i, operation, current_pph, target_pph, status, desc) in enumerate([
    (0, 0, "Overlock (SNLS)", "220", "260", "implemented", "Auto thread trimmer on OL machines"),
    (0, 1, "Collarette Attach", "180", "210", "under_review", "Use flat bed attachment"),
    (1, 2, "Sleeve Setting", "160", "200", "implemented", "Use sleeve setting jig"),
    (1, 3, "Pocket Hemming", "140", "175", "pending", "Stacker for pocket pieces"),
    (0, 4, "Hood Attachment", "150", "190", "under_review", "Auto folder for hood curve"),
    (1, 5, "Side Seam", "230", "270", "pending", "Bundle size reduction to 10 pcs"),
]):
    IeSuggestion.objects.get_or_create(
        production_line=lines[line_i], style=si(style_i), operation=operation,
        current_pph=Decimal(current_pph), target_pph=Decimal(target_pph),
        defaults={"description": desc, "status": status},
    )

# ── Skill Inventory ──────────────────────────────────────────────────────────
for i, (line_i, operator, skill, level, multi, assessed) in enumerate([
    (0, "Md. Rahim Uddin", "Overlock Machine", "expert", True, "2024-08-01"),
    (0, "Shirin Akter", "Flat Lock Machine", "expert", True, "2024-08-01"),
    (1, "Abdul Karim", "Collar Attach", "intermediate", False, "2024-08-05"),
    (1, "Fatema Begum", "Sleeve Setting", "intermediate", True, "2024-08-05"),
    (0, "Nasir Ahmed", "Button Holing", "beginner", False, "2024-08-10"),
    (1, "Selina Khatun", "Quality Checking", "expert", False, "2024-08-10"),
    (0, "Mizanur Rahman", "Press Machine", "intermediate", True, "2024-08-15"),
    (1, "Rina Chowdhury", "Overlock Machine", "beginner", False, "2024-08-15"),
]):
    SkillInventory.objects.get_or_create(
        operator_name=operator, skill_name=skill,
        defaults={"production_line": lines[line_i], "skill_level": level,
                  "multi_skill": multi, "last_assessed": date.fromisoformat(assessed)},
    )

# ── Production Downtime ──────────────────────────────────────────────────────
from datetime import datetime
from django.utils import timezone
for i, (line_i, style_i, start, hours, cause, status, desc) in enumerate([
    (0, 0, "2024-09-02 09:30", "1.5", "Machine Breakdown", "resolved", "OL machine needle bar bent"),
    (0, 1, "2024-09-03 10:00", "0.5", "Power Outage", "resolved", "Generator switched on"),
    (1, 2, "2024-09-04 09:00", "2.0", "Fabric Shortage", "resolved", "Awaiting grey fabric from dyeing"),
    (1, 3, "2024-09-05 11:30", "1.0", "Line Setup Change", "resolved", "Style change from STY-003 to STY-004"),
    (0, 4, "2024-09-08 09:00", "0.75", "Thread Breakage", "resolved", "Low quality cone replaced"),
    (1, 5, "2024-09-10 14:00", "1.25", "Machine Breakdown", "ongoing", "Feed off the arm motor fault"),
]):
    ProductionDowntime.objects.get_or_create(
        production_line=lines[line_i], style=si(style_i),
        start_datetime=timezone.make_aware(datetime.fromisoformat(start)),
        defaults={"duration_hours": Decimal(hours), "cause": cause, "description": desc, "status": status},
    )

# ── Process Wise Targets ─────────────────────────────────────────────────────
for i, (process, target, achieved, target_date, status) in enumerate([
    ("Cutting", 5000, 5200, "2024-09-30", "exceeded"),
    ("Sewing", 4800, 4600, "2024-09-30", "on_track"),
    ("Washing", 3500, 3100, "2024-09-30", "on_track"),
    ("Finishing", 4500, 4100, "2024-09-30", "on_track"),
    ("Packing", 4500, 3900, "2024-09-30", "behind"),
    ("Inspection", 5000, 4300, "2024-09-30", "behind"),
]):
    ProcessWiseTarget.objects.get_or_create(
        process_name=process, target_date=date.fromisoformat(target_date),
        defaults={"target_quantity": target, "achieved_quantity": achieved,
                  "variance": achieved - target, "status": status},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Style, "Styles"), (BuyerEnquiry, "Buyer Enquiries"), (PurchaseOrder, "Purchase Orders"),
    (SampleOrder, "Sample Orders"), (SMVRecord, "SMV Records"),
    (DevelopmentMonitoring, "Development Monitoring"), (BudgetDemandAssessment, "Budget Demand Assessments"),
    (IeSuggestion, "IE Suggestions"), (SkillInventory, "Skill Inventories"),
    (ProductionDowntime, "Production Downtimes"), (ProcessWiseTarget, "Process Wise Targets"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
