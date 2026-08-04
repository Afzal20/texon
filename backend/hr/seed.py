import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization, Location
from hr.models import Department, Designation, Employee, Attendance, Leave, Overtime, SalarySheet, Bonus
from authentication.models import User

print("Seeding hr data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})
dac, _ = Location.objects.get_or_create(organization=org, code="DAC", defaults={"name": "Dhaka Head Office", "city": "Dhaka", "country": "Bangladesh"})
cgp, _ = Location.objects.get_or_create(organization=org, code="CGP", defaults={"name": "Chittagong Factory", "city": "Chittagong", "country": "Bangladesh"})
gul, _ = Location.objects.get_or_create(organization=org, code="GUL", defaults={"name": "Gazipur Industrial Unit", "city": "Gazipur", "country": "Bangladesh"})
locations = {"DAC": dac, "CGP": cgp, "GUL": gul}

# ── Departments ─────────────────────────────────────────────────────────────
departments = {}
for code, name, desc in [
    ("MCH", "Merchandising", "Handles buyers, orders and product development"),
    ("PRD", "Production", "Garment manufacturing and production floor management"),
    ("QCD", "Quality Control", "Inspection and quality assurance across the factory"),
    ("HRD", "Human Resources", "Recruitment, payroll and employee relations"),
    ("FIN", "Accounts & Finance", "Financial accounting, costing and disbursement"),
    ("IEP", "IE & Planning", "Industrial engineering, line balancing and capacity planning"),
    ("STO", "Store & Inventory", "Raw material store and inventory management"),
    ("CUT", "Cutting", "Fabric cutting and marker planning"),
    ("SEW", "Sewing", "Sewing floor operations"),
    ("FNS", "Finishing", "Finishing, packing and final inspection"),
    ("CMP", "Compliance", "Social, environmental and safety compliance"),
]:
    d, _ = Department.objects.get_or_create(organization=org, code=code, defaults={"name": name, "description": desc})
    departments[code] = d

# ── Designations ────────────────────────────────────────────────────────────
designations = {}
for dep_code, code, name, desc in [
    ("MCH", "MCH-MER", "Merchandiser", "Buyer communication and order follow-up"),
    ("MCH", "MCH-SRM", "Senior Merchandiser", "Senior buyer account management"),
    ("MCH", "MCH-AMM", "Assistant Merchandiser", "Sample and order documentation support"),
    ("PRD", "PRD-MGR", "Production Manager", "Overall factory production management"),
    ("PRD", "PRD-SUP", "Production Supervisor", "Line supervision and output monitoring"),
    ("PRD", "PRD-OPR", "Machine Operator", "Sewing machine operations"),
    ("QCD", "QCD-MGR", "Quality Manager", "Quality assurance head"),
    ("QCD", "QCD-INS", "Quality Inspector", "Inline and final inspections"),
    ("HRD", "HRD-MGR", "HR Manager", "HR and payroll management"),
    ("HRD", "HRD-EXE", "HR Executive", "Recruitment and employee services"),
    ("FIN", "FIN-MGR", "Finance Manager", "Financial planning and reporting"),
    ("FIN", "FIN-AO", "Accounts Officer", "Accounts payable and receivable"),
    ("IEP", "IEP-EXE", "IE Executive", "Work study and line balancing"),
    ("IEP", "IEP-OFF", "IE Officer", "Method study and capacity analysis"),
    ("STO", "STO-KPR", "Store Keeper", "Raw material store operations"),
    ("STO", "STO-OFF", "Store Officer", "Store documentation and stock records"),
    ("CUT", "CUT-SUP", "Cutting Supervisor", "Cutting floor supervision"),
    ("CUT", "CUT-OPR", "Cutting Operator", "Fabric cutting operations"),
    ("SEW", "SEW-SUP", "Sewing Supervisor", "Sewing line supervision"),
    ("SEW", "SEW-OPR", "Sewing Operator", "Sewing line operations"),
    ("FNS", "FNS-SUP", "Finishing Supervisor", "Finishing floor supervision"),
    ("FNS", "FNS-OPR", "Finishing Operator", "Finishing and packing operations"),
    ("CMP", "CMP-MGR", "Compliance Manager", "Compliance program management"),
    ("CMP", "CMP-OFF", "Compliance Officer", "Audits and compliance checks"),
]:
    ds, _ = Designation.objects.get_or_create(
        organization=org, code=code,
        defaults={"department": departments[dep_code], "name": name, "description": desc},
    )
    designations[code] = ds

# ── Employees ───────────────────────────────────────────────────────────────
employees = []
for emp_id, first, last, dep, desig, loc, phone, dob, doj, etype, gender, status in [
    ("EMP-0001", "Abdul", "Karim", "MCH", "MCH-SRM", "DAC", "+8801811000001", "1982-03-15", "2010-01-02", "permanent", "male", "active"),
    ("EMP-0002", "Sharmin", "Akter", "MCH", "MCH-MER", "DAC", "+8801811000002", "1990-07-22", "2015-06-01", "permanent", "female", "active"),
    ("EMP-0003", "Rafiqul", "Islam", "MCH", "MCH-MER", "DAC", "+8801811000003", "1988-11-05", "2013-04-15", "permanent", "male", "active"),
    ("EMP-0004", "Mohammad", "Alam", "PRD", "PRD-MGR", "CGP", "+8801811000004", "1978-01-30", "2005-09-12", "permanent", "male", "active"),
    ("EMP-0005", "Tanvir", "Hossain", "PRD", "PRD-SUP", "CGP", "+8801811000005", "1985-09-18", "2012-03-01", "permanent", "male", "active"),
    ("EMP-0006", "Nurjahan", "Begum", "QCD", "QCD-MGR", "CGP", "+8801811000006", "1980-05-12", "2008-07-01", "permanent", "female", "active"),
    ("EMP-0007", "Farhana", "Khan", "QCD", "QCD-INS", "CGP", "+8801811000007", "1992-02-25", "2016-10-01", "permanent", "female", "active"),
    ("EMP-0008", "Nusrat", "Jahan", "HRD", "HRD-MGR", "DAC", "+8801811000008", "1983-06-08", "2009-01-05", "permanent", "female", "active"),
    ("EMP-0009", "Mamunur", "Rashid", "HRD", "HRD-EXE", "DAC", "+8801811000009", "1991-12-03", "2018-08-01", "permanent", "male", "active"),
    ("EMP-0010", "Sabina", "Yasmin", "FIN", "FIN-MGR", "DAC", "+8801811000010", "1984-04-17", "2011-02-01", "permanent", "female", "active"),
    ("EMP-0011", "Arif", "Chowdhury", "FIN", "FIN-AO", "DAC", "+8801811000011", "1993-08-29", "2019-05-01", "contract", "male", "active"),
    ("EMP-0012", "Mehedi", "Hasan", "IEP", "IEP-EXE", "GUL", "+8801811000012", "1990-10-11", "2014-03-01", "permanent", "male", "active"),
    ("EMP-0013", "Sajidur", "Rahman", "STO", "STO-KPR", "CGP", "+8801811000013", "1987-02-14", "2013-08-01", "permanent", "male", "active"),
    ("EMP-0014", "Rina", "Akter", "SEW", "SEW-OPR", "CGP", "+8801811000014", "1995-09-27", "2020-01-15", "permanent", "female", "active"),
    ("EMP-0015", "Selim", "Miah", "FNS", "FNS-OPR", "CGP", "+8801811000015", "1994-03-09", "2019-11-01", "temporary", "male", "active"),
    ("EMP-0016", "Parvez", "Alam", "CMP", "CMP-OFF", "CGP", "+8801811000016", "1989-07-21", "2016-01-01", "permanent", "male", "active"),
    ("EMP-0017", "Israt", "Jahan", "CUT", "CUT-OPR", "GUL", "+8801811000017", "1996-05-16", "2021-06-01", "contract", "female", "active"),
    ("EMP-0018", "Jubayer", "Ahmed", "IEP", "IEP-OFF", "GUL", "+8801811000018", "1997-11-02", "2023-02-01", "probation", "male", "inactive"),
]:
    e, _ = Employee.objects.get_or_create(
        organization=org, employee_id=emp_id,
        defaults={"department": departments[dep], "designation": designations[desig], "location": locations[loc],
                  "first_name": first, "last_name": last, "email": f"{first.lower()}.{last.lower()}@texon.com",
                  "phone": phone, "date_of_birth": date.fromisoformat(dob), "date_of_joining": date.fromisoformat(doj),
                  "employment_type": etype, "gender": gender, "status": status, "is_active": status == "active"},
    )
    employees.append(e)

def emp(eid): return next(e for e in employees if e.employee_id == eid)

# ── Attendance ──────────────────────────────────────────────────────────────
for e in employees[:10]:
    for d in [date(2024, 11, 4), date(2024, 11, 5), date(2024, 11, 6), date(2024, 11, 7), date(2024, 11, 8), date(2024, 11, 9)]:
        if d.weekday() == 4:
            status, ci, co, notes = "holiday", None, None, "Weekly holiday"
        else:
            status = random.choice(["present", "present", "present", "late", "absent", "leave"])
            ci, co, notes = None, None, ""
            if status in ("present", "late"):
                ci, co = f"09:{random.randint(0, 30):02d}", f"18:{random.randint(0, 45):02d}"
            if status == "late":
                notes = "Late arrival"
            elif status == "leave":
                notes = "On approved leave"
        Attendance.objects.get_or_create(
            employee=e, date=d,
            defaults={"check_in": ci, "check_out": co, "status": status, "notes": notes},
        )

# ── Leaves ──────────────────────────────────────────────────────────────────
for emp_id, ltype, start, days, reason, status, approver in [
    ("EMP-0002", "sick", "2024-11-11", 3, "Fever and flu", "approved", "HR Manager"),
    ("EMP-0003", "annual", "2024-12-15", 10, "Annual vacation to Cox's Bazar", "approved", "HR Manager"),
    ("EMP-0004", "personal", "2024-11-20", 2, "Family event", "pending", ""),
    ("EMP-0006", "maternity", "2024-12-01", 112, "Maternity leave", "approved", "HR Manager"),
    ("EMP-0007", "annual", "2024-12-22", 7, "Year-end leave", "pending", ""),
    ("EMP-0009", "sick", "2024-11-25", 2, "Medical treatment", "approved", "HR Manager"),
    ("EMP-0011", "unpaid", "2025-01-05", 5, "Personal errand", "rejected", "HR Manager"),
    ("EMP-0013", "paternity", "2025-01-10", 5, "Child birth", "approved", "HR Manager"),
    ("EMP-0018", "personal", "2024-11-18", 1, "Half-day personal work", "cancelled", "HR Manager"),
]:
    Leave.objects.get_or_create(
        employee=emp(emp_id), leave_type=ltype, start_date=date.fromisoformat(start),
        defaults={"end_date": date.fromisoformat(start) + timedelta(days=days - 1), "total_days": days,
                  "reason": reason, "status": status, "approved_by": approver},
    )

# ── Overtime ────────────────────────────────────────────────────────────────
for emp_id, odate, hours, rate, status, approver in [
    ("EMP-0001", "2024-11-06", "2.50", "350.00", "paid", "Production Manager"),
    ("EMP-0002", "2024-11-07", "3.00", "300.00", "paid", "HR Manager"),
    ("EMP-0004", "2024-11-06", "2.00", "450.00", "paid", "HR Manager"),
    ("EMP-0005", "2024-11-08", "4.00", "320.00", "approved", "HR Manager"),
    ("EMP-0010", "2024-11-07", "1.50", "400.00", "paid", "HR Manager"),
    ("EMP-0012", "2024-11-09", "3.50", "280.00", "pending", ""),
    ("EMP-0013", "2024-11-08", "2.00", "250.00", "paid", "HR Manager"),
    ("EMP-0016", "2024-11-09", "2.50", "260.00", "approved", "HR Manager"),
]:
    Overtime.objects.get_or_create(
        employee=emp(emp_id), date=date.fromisoformat(odate),
        defaults={"hours": Decimal(hours), "rate": Decimal(rate), "total_amount": Decimal(hours) * Decimal(rate),
                  "status": status, "approved_by": approver, "notes": ""},
    )

# ── Salary Sheets ───────────────────────────────────────────────────────────
for emp_id, basic, allow, deduct, ot, bonus, status in [
    ("EMP-0001", 85000, 15000, 5200, 875, 0, "paid"),
    ("EMP-0002", 62000, 10000, 4100, 900, 0, "paid"),
    ("EMP-0003", 60000, 10000, 3950, 0, 0, "paid"),
    ("EMP-0004", 95000, 20000, 6150, 900, 0, "paid"),
    ("EMP-0005", 58000, 9000, 3750, 1280, 0, "paid"),
    ("EMP-0006", 92000, 18000, 5980, 0, 0, "paid"),
    ("EMP-0007", 35000, 6000, 2300, 0, 0, "approved"),
    ("EMP-0008", 88000, 16000, 5720, 0, 0, "paid"),
    ("EMP-0009", 42000, 7000, 2740, 0, 0, "paid"),
    ("EMP-0010", 90000, 17000, 5850, 600, 0, "paid"),
    ("EMP-0011", 38000, 6500, 2470, 0, 0, "approved"),
    ("EMP-0012", 52000, 8500, 3380, 980, 0, "paid"),
    ("EMP-0013", 28000, 5000, 1820, 500, 0, "paid"),
    ("EMP-0014", 22000, 4000, 1430, 0, 0, "paid"),
    ("EMP-0015", 21000, 3500, 1365, 0, 0, "draft"),
    ("EMP-0016", 45000, 7500, 2925, 650, 0, "paid"),
    ("EMP-0017", 23000, 4000, 1495, 0, 0, "paid"),
    ("EMP-0018", 18000, 3000, 1170, 0, 0, "draft"),
]:
    e = emp(emp_id)
    net = basic + allow + ot + bonus - deduct
    SalarySheet.objects.get_or_create(
        organization=org, employee=e, month="2024-11",
        defaults={"basic_salary": Decimal(str(basic)), "allowances": Decimal(str(allow)), "deductions": Decimal(str(deduct)),
                  "overtime_amount": Decimal(str(ot)), "bonus_amount": Decimal(str(bonus)), "net_salary": Decimal(str(net)),
                  "status": status, "payment_date": date(2024, 12, 1) if status == "paid" else None, "notes": ""},
    )

# ── Bonuses ─────────────────────────────────────────────────────────────────
for emp_id, btype, amount, bdate, desc, status in [
    ("EMP-0001", "festival", 25000, "2025-03-30", "Eid-ul-Fitr festival bonus", "paid"),
    ("EMP-0002", "festival", 20000, "2025-03-30", "Eid-ul-Fitr festival bonus", "paid"),
    ("EMP-0004", "festival", 30000, "2025-03-30", "Eid-ul-Fitr festival bonus", "paid"),
    ("EMP-0008", "festival", 28000, "2025-03-30", "Eid-ul-Fitr festival bonus", "paid"),
    ("EMP-0001", "festival", 25000, "2025-06-07", "Eid-ul-Adha festival bonus", "paid"),
    ("EMP-0004", "festival", 30000, "2025-06-07", "Eid-ul-Adha festival bonus", "paid"),
    ("EMP-0006", "performance", 35000, "2024-12-20", "Best quality performance Q4 2024", "approved"),
    ("EMP-0005", "attendance", 5000, "2025-01-15", "Perfect attendance 2024", "paid"),
    ("EMP-0014", "special", 10000, "2024-12-25", "Special recognition for line output", "approved"),
]:
    Bonus.objects.get_or_create(
        employee=emp(emp_id), bonus_type=btype, bonus_date=date.fromisoformat(bdate),
        defaults={"amount": Decimal(str(amount)), "description": desc, "status": status},
    )

# ── Link HR user to employee ─────────────────────────────────────────────────
try:
    hr_user = User.objects.get(email="hr@texon.com")
    if hr_user.employee is None:
        hr_user.employee = emp("EMP-0008")
        hr_user.save()
except User.DoesNotExist:
    pass

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Department, "Departments"), (Designation, "Designations"), (Employee, "Employees"),
    (Attendance, "Attendance"), (Leave, "Leaves"), (Overtime, "Overtime"),
    (SalarySheet, "Salary Sheets"), (Bonus, "Bonuses"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
