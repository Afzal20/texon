import os, sys
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization
from buyers.models import Buyer
from compliance.models import ComplianceRecord

print("Seeding compliance data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
    ("Nike Inc.", "NKE", "USA"), ("Adidas AG", "ADI", "Germany"),
]:
    b, _ = Buyer.objects.get_or_create(organization=org, code=code, defaults={"name": name, "country": country})
    buyers.append(b)

def bi(i): return buyers[i % len(buyers)]

# ── Compliance Records ───────────────────────────────────────────────────────
for ctype, title, desc, buyer_i, audit_by, audit_date, score, status, findings, actions, follow_up in [
    ("social", "SEDEX Social Audit", "SMETA 4-pillar ethical trade audit covering labor, health & safety, environment and business ethics", 0, "SGS", "2024-03-12", 92, "passed",
     "Minor issues on overtime hours documentation", "Overtime registers updated; AOP posters displayed", "2024-05-10"),
    ("social", "BSCI Audit", "amfori BSCI social compliance audit with full facility walkthrough and worker interviews", 1, "Intertek", "2024-03-25", 84, "corrective_action",
     "Child labor prevention policy incomplete", "Policy updated and shared with all workers", "2024-06-15"),
    ("environmental", "OEKO-TEX Standard 100", "Product safety certification for all exported garments and accessories", 2, "OEKO-TEX Institute", "2024-02-18", 96, "passed",
     "No findings", "", None),
    ("social", "WRAP Certification", "Worldwide Responsible Accredited Production audit for ethical manufacturing", 3, "WRAP", "2024-04-05", 90, "passed",
     "Fire exit signage partly faded", "Signage replaced on all floors", "2024-07-01"),
    ("environmental", "Higg FEM Assessment", "Sustainable Apparel Coalition facility environmental module assessment", 4, "Cascale", "2024-04-20", 84, "corrective_action",
     "Chemical management plan not fully digitized", "Digital MRSL checklist introduced", "2024-08-01"),
    ("social", "SLCP Social & Labor Convergence", "SLCP social and labor assessment covering hours, wages and grievance mechanism", 5, "SLCP", "2024-05-08", 87, "passed",
     "Grievance box found locked", "Grievance boxes unlocked and monitored weekly", "2024-08-20"),
    ("safety", "Accord Fire & Building Safety Inspection", "Fire and electrical safety inspection under Accord remediation program", 0, "Accord on Fire and Building Safety", "2024-05-15", 78, "corrective_action",
     "Electrical panel bundling found in 2 zones", "Bundling removed; thermography survey completed", "2024-09-01"),
    ("quality", "ISO 9001:2015 Surveillance Audit", "Annual surveillance audit of the quality management system", 1, "Bureau Veritas", "2024-06-10", 91, "passed",
     "Calibration records of 3 gauges pending", "Gauges recalibrated and records updated", "2024-09-15"),
    ("ethical", "amfori Ethics & Anti-Corruption Audit", "Ethics and anti-corruption assessment covering gift policy and whistleblowing", 2, "Intertek", "2024-06-28", 85, "planned",
     "No findings", "", None),
    ("environmental", "ISO 14001:2015 Recertification", "Environmental management system recertification audit", 3, "TUV Rheinland", "2024-09-15", 89, "in_progress",
     "", "", "2024-11-01"),
]:
    ComplianceRecord.objects.get_or_create(
        organization=org, buyer=bi(buyer_i), title=title, audit_date=date.fromisoformat(audit_date),
        defaults={"compliance_type": ctype, "description": desc, "audit_by": audit_by,
                  "score": Decimal(score) if score else None, "status": status,
                  "findings": findings, "corrective_actions": actions,
                  "follow_up_date": date.fromisoformat(follow_up) if follow_up else None},
    )

# ── Summary ──────────────────────────────────────────────────────────────────
print(f"  Compliance Records: {ComplianceRecord.objects.count()}")
print("Done!")
