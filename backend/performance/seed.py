import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from buyers.models import Buyer
from merchandising.models import Style
from production.models import ProductionLine
from performance.models import PerformanceRecord

print("Seeding performance data...")

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
    s, _ = Style.objects.get_or_create(style_number=snum, defaults={"name": name, "buyer": buyers[0]})
    styles.append(s)

lines = []
for name, code, loc, cap in [
    ("Line 1", "LN-01", "Unit 1, Ashulia", 500), ("Line 2", "LN-02", "Unit 1, Ashulia", 600),
    ("Line 3", "LN-03", "Unit 2, Gazipur", 800), ("Line 4", "LN-04", "Unit 2, Gazipur", 900),
    ("Line 5", "LN-05", "Unit 3, Savar", 1000), ("Line 6", "LN-06", "Unit 3, Savar", 1200),
]:
    ln, _ = ProductionLine.objects.get_or_create(code=code, defaults={"name": name, "location": loc, "capacity": cap})
    lines.append(ln)

def li(i): return lines[i % len(lines)]
def si(i): return styles[i % len(styles)]

# ── Performance Records ──────────────────────────────────────────────────────
for line_i, style_i, rec_date, metric, value, target, unit, notes in [
    (0, 0, "2024-10-14", "Line Efficiency %", 68.40, 75.00, "%", ""),
    (1, 1, "2024-10-14", "Line Efficiency %", 71.25, 75.00, "%", ""),
    (2, 2, "2024-10-14", "Line Efficiency %", 64.80, 75.00, "%", "Low due to fabric shade change"),
    (3, 3, "2024-10-14", "Line Efficiency %", 73.60, 75.00, "%", ""),
    (4, 4, "2024-10-14", "Line Efficiency %", 77.90, 75.00, "%", "Best line of the day"),
    (5, 5, "2024-10-14", "Line Efficiency %", 66.10, 75.00, "%", ""),
    (0, 0, "2024-10-14", "Output (pcs)", 968, 1000, "pcs", ""),
    (1, 1, "2024-10-14", "Output (pcs)", 1045, 1000, "pcs", ""),
    (2, 2, "2024-10-14", "Output (pcs)", 812, 1000, "pcs", ""),
    (3, 3, "2024-10-14", "Output (pcs)", 1130, 1000, "pcs", ""),
    (4, 4, "2024-10-14", "Output (pcs)", 1218, 1000, "pcs", ""),
    (5, 5, "2024-10-14", "Output (pcs)", 894, 1000, "pcs", ""),
    (0, 0, "2024-10-15", "SMV Achievement %", 98.50, 100.00, "%", ""),
    (2, 2, "2024-10-15", "SMV Achievement %", 92.30, 100.00, "%", "New style learning curve"),
    (3, 3, "2024-10-15", "SMV Achievement %", 104.80, 100.00, "%", ""),
    (4, 4, "2024-10-15", "SMV Achievement %", 107.20, 100.00, "%", ""),
    (1, 1, "2024-10-15", "Absenteeism %", 4.50, 5.00, "%", ""),
    (3, 3, "2024-10-15", "Absenteeism %", 8.20, 5.00, "%", "Seasonal flu in factory"),
    (4, 4, "2024-10-15", "Absenteeism %", 2.80, 5.00, "%", ""),
    (5, 5, "2024-10-15", "Absenteeism %", 6.40, 5.00, "%", ""),
]:
    PerformanceRecord.objects.get_or_create(
        production_line=li(line_i), record_date=date.fromisoformat(rec_date), metric=metric,
        defaults={"style": si(style_i), "value": Decimal(str(value)), "target": Decimal(str(target)),
                  "unit": unit, "notes": notes},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
print(f"  Performance Records: {PerformanceRecord.objects.count()}")
print("Done!")
