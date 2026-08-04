import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from core.models import Organization, Currency
from buyers.models import Buyer
from procurement.models import Supplier
from accounts.models import (
    ChartOfAccount, CostCenter, JournalEntry, AccountsPayable, AccountsReceivable, Expense,
)

print("Seeding accounts data...")

org, _ = Organization.objects.get_or_create(code="TEXON", defaults={"name": "Texon RMG Ltd", "is_active": True})
usd, _ = Currency.objects.get_or_create(code="USD", defaults={"name": "US Dollar", "symbol": "$", "exchange_rate": 1.0, "is_base": True})

buyers = []
for name, code, country in [
    ("H&M Group", "HM", "Sweden"), ("Zara (Inditex)", "ZRA", "Spain"),
    ("Uniqlo (Fast Retailing)", "UNQ", "Japan"), ("Levi Strauss & Co.", "LEV", "USA"),
    ("Nike Inc.", "NKE", "USA"), ("Adidas AG", "ADI", "Germany"),
]:
    b, _ = Buyer.objects.get_or_create(organization=org, code=code, defaults={"name": name, "country": country})
    buyers.append(b)

suppliers = []
for name, code, stype in [
    ("Envoy Textiles Ltd", "ENV", "fabric"), ("Coats Bangladesh", "CTS", "trim"),
    ("YKK Bangladesh", "YKK", "accessory"), ("Pacific Accessories", "PAC", "accessory"),
    ("DBL Group", "DBL", "fabric"), ("Fakir Knitwears", "FKW", "fabric"),
]:
    s, _ = Supplier.objects.get_or_create(organization=org, code=code, defaults={"name": name, "supplier_type": stype})
    suppliers.append(s)

# ── Chart of Accounts ───────────────────────────────────────────────────────
for code, name, atype in [
    ("1101", "Cash & Bank", "asset"), ("1201", "Accounts Receivable", "asset"),
    ("1301", "Inventory", "asset"), ("1401", "Fixed Assets", "asset"),
    ("2101", "Accounts Payable", "liability"), ("2105", "Bank Loan", "liability"),
    ("2201", "Accrued Expenses", "liability"), ("3101", "Owner's Equity", "equity"),
    ("4101", "Sales Revenue", "revenue"), ("4201", "Other Income", "revenue"),
    ("5101", "Cost of Goods Sold", "expense"), ("5201", "Operating Expenses", "expense"),
]:
    ChartOfAccount.objects.get_or_create(
        organization=org, account_code=code,
        defaults={"account_name": name, "account_type": atype},
    )

coa = {a.account_code: a for a in ChartOfAccount.objects.filter(organization=org)}

# ── Cost Centers ────────────────────────────────────────────────────────────
for name, code, dept, budget in [
    ("Cutting", "CC-CUT", "Cutting", 1200000), ("Sewing", "CC-SEW", "Sewing", 3500000),
    ("Finishing", "CC-FIN", "Finishing", 1500000), ("Packing", "CC-PAK", "Packing", 900000),
    ("Merchandising", "CC-MER", "Merchandising", 600000), ("HR & Admin", "CC-HRA", "HR & Admin", 800000),
]:
    CostCenter.objects.get_or_create(
        organization=org, code=code,
        defaults={"name": name, "department": dept, "budget": Decimal(str(budget))},
    )

cost_centers = {c.code: c for c in CostCenter.objects.filter(organization=org)}

# ── Journal Entries ─────────────────────────────────────────────────────────
for num, edate, acct_code, debit, credit, ref, by, desc in [
    ("JE-0001", "2024-10-15", "1201", 428600, 0, "INV-2418", "Finance Team", "Sales invoice INV-2418"),
    ("JE-0002", "2024-10-15", "1101", 428600, 0, "RLZ-2418", "Finance Team", "Realization against INV-2418"),
    ("JE-0003", "2024-10-14", "5101", 356240, 0, "INV-2415", "Finance Team", "COGS for INV-2415"),
    ("JE-0004", "2024-10-14", "1201", 356240, 0, "INV-2415", "Finance Team", "Sales invoice INV-2415"),
    ("JE-0005", "2024-10-12", "1301", 186420, 0, "PUR-2401", "Finance Team", "Fabric purchase ENV-8842"),
    ("JE-0006", "2024-10-10", "2105", 100000, 0, "LOAN-EMI-09", "Finance Team", "Bank loan installment Sep"),
    ("JE-0007", "2024-10-08", "2101", 186420, 0, "DIS-2418", "Finance Team", "Payment to Envoy Textiles"),
    ("JE-0008", "2024-10-05", "5201", 42800, 0, "DIS-2415", "Finance Team", "Freight charges export"),
    ("JE-0009", "2024-10-03", "1301", 542000, 0, "BTB-2418", "Finance Team", "Fabric under BTB LC"),
    ("JE-0010", "2024-10-01", "1201", 542000, 0, "INV-2405", "Finance Team", "Sales invoice INV-2405"),
    ("JE-0011", "2024-09-30", "5201", 28600, 0, "DIS-2412", "Finance Team", "Customs duty import"),
    ("JE-0012", "2024-09-28", "4201", 12500, 0, "SCRAP-SALE", "Finance Team", "Scrap fabric sale"),
    ("JE-0013", "2024-09-25", "5101", 94800, 0, "INV-2395", "Finance Team", "COGS for INV-2395"),
    ("JE-0014", "2024-09-22", "1201", 318500, 0, "INV-2402", "Finance Team", "Sales invoice INV-2402"),
    ("JE-0015", "2024-09-20", "2201", 15000, 0, "SAL-ADVANCE", "Finance Team", "Salary advance accrual"),
]:
    JournalEntry.objects.get_or_create(
        organization=org, entry_number=num,
        defaults={"entry_date": date.fromisoformat(edate), "description": desc,
                  "account": coa[acct_code], "debit": Decimal(str(debit)), "credit": Decimal(str(credit)),
                  "currency": usd, "reference": ref, "created_by": by},
    )

# ── Accounts Payable ────────────────────────────────────────────────────────
for inv_num, sup_i, idate, due, amount, paid, status, notes in [
    ("AP-SUP-2401", 0, "2024-10-01", "2024-11-15", 150000, 90000, "partial", "Fabric invoice ENV-2401"),
    ("AP-SUP-2402", 1, "2024-10-02", "2024-11-16", 42500, 0, "pending", "Thread supply invoice"),
    ("AP-SUP-2403", 2, "2024-10-03", "2024-11-17", 68300, 68300, "paid", "Zipper supply invoice"),
    ("AP-SUP-2404", 3, "2024-10-04", "2024-10-18", 31200, 0, "overdue", "Accessory supply invoice"),
    ("AP-SUP-2405", 4, "2024-10-05", "2024-11-19", 186420, 100000, "partial", "Fabric invoice DBL-2405"),
    ("AP-SUP-2406", 5, "2024-10-06", "2024-11-20", 94800, 0, "pending", "Knit fabric invoice"),
    ("AP-SUP-2407", 0, "2024-10-08", "2024-11-22", 220500, 220500, "paid", "Fabric invoice ENV-2407"),
    ("AP-SUP-2408", 2, "2024-10-09", "2024-11-23", 15700, 0, "pending", "Button supply invoice"),
    ("AP-SUP-2409", 1, "2024-10-10", "2024-10-24", 28900, 5000, "overdue", "Trim supply invoice"),
    ("AP-SUP-2410", 3, "2024-10-12", "2024-11-26", 54200, 25000, "partial", "Accessory invoice PAC-2410"),
]:
    AccountsPayable.objects.get_or_create(
        organization=org, invoice_number=inv_num,
        defaults={"supplier": suppliers[sup_i], "invoice_date": date.fromisoformat(idate),
                  "due_date": date.fromisoformat(due), "amount": Decimal(str(amount)),
                  "paid_amount": Decimal(str(paid)), "balance": Decimal(str(amount - paid)),
                  "status": status, "notes": notes},
    )

# ── Accounts Receivable ─────────────────────────────────────────────────────
for inv_num, buyer_i, idate, due, amount, received, status, notes in [
    ("AR-INV-2401", 0, "2024-10-14", "2024-11-13", 428600, 428600, "received", "Invoice INV-2418"),
    ("AR-INV-2402", 1, "2024-10-13", "2024-11-12", 356240, 356240, "received", "Invoice INV-2415"),
    ("AR-INV-2403", 2, "2024-10-12", "2024-11-11", 284900, 0, "pending", "Invoice INV-2412"),
    ("AR-INV-2404", 3, "2024-10-10", "2024-10-24", 196800, 0, "overdue", "Invoice INV-2408"),
    ("AR-INV-2405", 4, "2024-10-08", "2024-11-07", 542000, 542000, "received", "Invoice INV-2405"),
    ("AR-INV-2406", 5, "2024-10-05", "2024-11-04", 318500, 318500, "received", "Invoice INV-2402"),
    ("AR-INV-2407", 0, "2024-10-01", "2024-10-31", 186420, 186420, "received", "Invoice INV-2398"),
    ("AR-INV-2408", 1, "2024-09-28", "2024-10-28", 94800, 50000, "partial", "Invoice INV-2395"),
    ("AR-INV-2409", 2, "2024-09-25", "2024-10-25", 22760, 0, "pending", "Invoice INV-2392"),
    ("AR-INV-2410", 3, "2024-09-22", "2024-10-22", 54980, 0, "overdue", "Invoice INV-2388"),
]:
    AccountsReceivable.objects.get_or_create(
        organization=org, invoice_number=inv_num,
        defaults={"buyer": buyers[buyer_i], "invoice_date": date.fromisoformat(idate),
                  "due_date": date.fromisoformat(due), "amount": Decimal(str(amount)),
                  "received_amount": Decimal(str(received)), "balance": Decimal(str(amount - received)),
                  "status": status, "notes": notes},
    )

# ── Expenses ────────────────────────────────────────────────────────────────
for cc_code, edate, category, desc, amount, status, by in [
    ("CC-SEW", "2024-10-05", "Utilities", "Electricity bill - sewing floor", 24500, "approved", "Admin Officer"),
    ("CC-CUT", "2024-10-04", "Maintenance", "Cutting machine blade replacement", 18500, "approved", "Maintenance Dept"),
    ("CC-FIN", "2024-10-03", "Transport", "Finishing goods transport to warehouse", 12600, "approved", "Logistics Dept"),
    ("CC-PAK", "2024-10-02", "Stationery", "Carton boxes and packing tape", 3800, "pending", "Store In-charge"),
    ("CC-HRA", "2024-10-01", "Utilities", "Office electricity and water bill", 9500, "approved", "Admin Officer"),
    ("CC-MER", "2024-09-30", "Transport", "Buyer visit pickup and drop", 7200, "approved", "Merchandising Dept"),
    ("CC-SEW", "2024-09-28", "Stationery", "Needles and spare parts", 2600, "approved", "Maintenance Dept"),
    ("CC-CUT", "2024-09-25", "Utilities", "Compressor electricity surcharge", 15800, "approved", "Admin Officer"),
    ("CC-FIN", "2024-09-22", "Maintenance", "Ironing machine service", 9300, "pending", "Maintenance Dept"),
    ("CC-PAK", "2024-09-20", "Transport", "Export cartons to port", 8400, "approved", "Logistics Dept"),
    ("CC-HRA", "2024-09-18", "Stationery", "Office stationery for September", 5400, "approved", "Admin Officer"),
    ("CC-MER", "2024-09-15", "Maintenance", "Laptop repair - merchandising", 6700, "rejected", "Merchandising Dept"),
]:
    Expense.objects.get_or_create(
        organization=org, cost_center=cost_centers[cc_code], expense_date=date.fromisoformat(edate),
        category=category, amount=Decimal(str(amount)),
        defaults={"description": desc, "currency": usd,
                  "approved_by": "Finance Manager" if status == "approved" else "",
                  "status": status, "created_by": by},
    )

# ── Summary ─────────────────────────────────────────────────────────────────
for model, label in [
    (ChartOfAccount, "Chart of Accounts"), (CostCenter, "Cost Centers"), (JournalEntry, "Journal Entries"),
    (AccountsPayable, "Accounts Payable"), (AccountsReceivable, "Accounts Receivable"), (Expense, "Expenses"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
