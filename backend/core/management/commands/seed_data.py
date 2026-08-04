from __future__ import annotations

import random
from datetime import date, datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from accounts.models import AccountsPayable, AccountsReceivable, ChartOfAccount, CostCenter, Expense, JournalEntry
from buyers.models import Buyer, BuyerPortfolio, BuyerRating
from commercial.models import BillOfExchange, Invoice, LetterOfCredit, Shipment
from compliance.models import ComplianceRecord
from core.models import Currency, Location
from costing.models import CostSheet, PreCosting
from crm.models import BuyerCommunication, BuyerProfitability, OrderAmendmentHistory
from fixed_assets.models import AssetCategory, DepreciationSchedule, FixedAsset
from hr.models import Attendance, Bonus, Department, Designation, Employee, Leave, Overtime, SalarySheet
from ie_planning.models import CapacityBooking, LinePlan, ProductionPlan, RiskAssessment, StyleAnalysis
from inventory.models import Accessory, Fabric, PhysicalInventory, ShadeApproval, StockMovement, Trim, Warehouse
from merchandising.models import BuyerEnquiry, DevelopmentMonitoring, PurchaseOrder, SMVRecord, SampleOrder, Style
from multi_company.models import GroupCompany, LocationBasedOperation, MultiCompany
from orders.models import Order
from performance.models import PerformanceRecord
from planning.models import Plan
from procurement.models import QuotationAnalysis, RawMaterialBooking, RawMaterialRequisition, Supplier
from production.models import CuttingRecord, FloorRequisition, InspectionPacking, ProductionLine, ProductionOrder, SewingRecord
from quality.models import DefectCategory, EndLineQC, FabricInspection, FinalInspection, InlineQC, RejectionReport
from reporting.models import Dashboard, Report
from scheduling.models import Schedule
from subcontract.models import SubcontractOrder, SubcontractTracking
from tna.models import JobOrder, Task, Timeline

fake = Faker()
Faker.seed(42)
random.seed(42)

ORG_ID = 1


def weighted_choice(items: list[tuple]) -> str:
    """Pick from [(value, weight), ...]"""
    total = sum(w for _, w in items)
    r = random.random() * total
    upto = 0
    for v, w in items:
        upto += w
        if r <= upto:
            return v
    return items[-1][0]


class Command(BaseCommand):
    help = "Seed database with realistic RMG factory test data"

    def handle(self, *args, **options):
        self._run()
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))

    @transaction.atomic
    def _run(self):
        self._seed_currencies()
        self._seed_locations()
        if not Department.objects.exists():
            self._seed_designations()
        if not Employee.objects.exists():
            self._seed_employees()
        if not Buyer.objects.exists():
            self._seed_buyers()
        if not Style.objects.exists():
            self._seed_styles()
        if not Supplier.objects.exists():
            self._seed_suppliers()
        if not PurchaseOrder.objects.exists():
            self._seed_merchandising()
        if not ProductionLine.objects.exists():
            self._seed_production_lines()
        if not Warehouse.objects.exists():
            self._seed_inventory()
        if not RawMaterialRequisition.objects.exists():
            self._seed_procurement()
        self._seed_quotation_analyses()
        self._seed_defect_categories()
        if not ProductionOrder.objects.exists():
            self._seed_production()
        if not InlineQC.objects.exists():
            self._seed_quality()
        if not SubcontractOrder.objects.exists():
            self._seed_subcontract()
        if not CostCenter.objects.exists():
            self._seed_cost_centers()
        if not ChartOfAccount.objects.exists():
            self._seed_chart_of_accounts()
        if not AccountsPayable.objects.exists():
            self._seed_accounts()
        if not LetterOfCredit.objects.exists():
            self._seed_commercial()
        if not BuyerCommunication.objects.exists():
            self._seed_crm()
        if not Attendance.objects.exists():
            self._seed_hr_details()
        if not AssetCategory.objects.exists():
            self._seed_fixed_assets()
        if not Task.objects.exists():
            self._seed_tna()
        self._seed_alarm_notifications()
        if not CapacityBooking.objects.exists():
            self._seed_ie_planning()
        if not PreCosting.objects.exists():
            self._seed_costing()
        if not GroupCompany.objects.exists():
            self._seed_multi_company()
        if not Order.objects.exists():
            self._seed_orders()
        if not ComplianceRecord.objects.exists():
            self._seed_compliance()
        if not Report.objects.exists():
            self._seed_reporting()
        if not PerformanceRecord.objects.exists():
            self._seed_performance()
        if not Plan.objects.exists():
            self._seed_planning()
        if not Schedule.objects.exists():
            self._seed_scheduling()
        self._seed_otps()
        self._seed_ai()

    # ── helpers ──────────────────────────────────────────────────────
    def _rand_date(self, start="-2y", end="+30d") -> date:
        return fake.date_between(start=start, end=end)

    def _past_date(self, days_ago_max=730):
        return date.today() - timedelta(days=random.randint(1, max(1, days_ago_max)))

    def _future_date(self, days_ahead_max=60):
        return date.today() + timedelta(days=random.randint(1, max(1, days_ahead_max)))

    def _dec(self, lo, hi, dp=2):
        return Decimal(str(round(random.uniform(lo, hi), dp)))

    # ── Core ─────────────────────────────────────────────────────────
    def _seed_currencies(self):
        from core.models import Currency
        if Currency.objects.exists():
            return
        data = [
            ("USD", "US Dollar", "$", Decimal("1.000000"), True),
            ("BDT", "Bangladeshi Taka", "৳", Decimal("0.009091"), False),
            ("EUR", "Euro", "€", Decimal("1.080000"), False),
            ("GBP", "British Pound", "£", Decimal("1.250000"), False),
            ("INR", "Indian Rupee", "₹", Decimal("0.012000"), False),
        ]
        for code, name, sym, rate, base in data:
            Currency.objects.create(
                code=code, name=name, symbol=sym,
                exchange_rate=rate, is_base=base,
            )

    def _seed_locations(self):
        from core.models import Location
        if Location.objects.exists():
            return
        for name, code in [("Dhaka Factory", "DAC"), ("Chittagong Port Warehouse", "CGP"), ("Gulshan Office", "GUL")]:
            Location.objects.create(
                organization_id=ORG_ID, name=name, code=code,
                city=fake.city(), country="Bangladesh",
            )

    # ── HR ───────────────────────────────────────────────────────────
    def _seed_designations(self):
        from hr.models import Designation
        if Designation.objects.exists():
            return
        dept_ids = list(range(1, 10))
        roles = {
            1: ["Cutter", "Cutting Master", "Cutting Supervisor"],
            2: ["Sewing Operator", "Sewing Supervisor", "Line Chief"],
            3: ["Finishing Worker", "Finishing Supervisor", "Packing Supervisor"],
            4: ["QC Inspector", "QC Supervisor", "QA Manager"],
            5: ["Accountant", "Senior Accountant", "Finance Manager"],
            6: ["HR Officer", "HR Manager", "Recruiter"],
            7: ["Merchandiser", "Senior Merchandiser", "Merchandising Manager"],
            8: ["Admin Officer", "Admin Manager", "Store Keeper"],
            9: ["IT Support", "System Administrator", "IT Manager"],
        }
        for dept_id in dept_ids:
            for idx, name in enumerate(roles.get(dept_id, ["Staff"]), 1):
                code = f"D{dept_id:02d}{idx:02d}"
                Designation.objects.create(
                    organization_id=ORG_ID, department_id=dept_id,
                    name=name, code=code,
                )

    def _seed_employees(self):
        from hr.models import Employee
        if Employee.objects.filter(employee_id__startswith="EMP").exists():
            return
        desig_ids = list(Designation.objects.values_list("id", flat=True))
        for i in range(1, 46):
            first = fake.first_name()
            last = fake.last_name()
            eid = f"EMP{1000 + i}"
            Employee.objects.create(
                organization_id=ORG_ID,
                department_id=random.choice(list(range(1, 10))),
                designation_id=random.choice(desig_ids),
                location_id=random.choice([1, 2, 3]),
                employee_id=eid,
                first_name=first,
                last_name=last,
                email=f"{eid.lower()}@texon.com",
                phone=fake.phone_number()[:20],
                date_of_birth=self._past_date(365 * 40),
                date_of_joining=self._past_date(365 * 5),
                employment_type=random.choice(["permanent", "permanent", "permanent", "contract", "probation"]),
                gender=random.choice(["male", "female", "male", "male", "female"]),
                status="active",
            )

    # ── Buyers ───────────────────────────────────────────────────────
    def _seed_buyers(self):
        from buyers.models import Buyer
        from buyers.models import BuyerRating, BuyerPortfolio
        if Buyer.objects.exists():
            return
        names = [
            ("H&M", "H&M", "Sweden"), ("Zara", "ZAR", "Spain"),
            ("Nike", "NKE", "USA"), ("Adidas", "ADD", "Germany"),
            ("Levi's", "LEV", "USA"), ("Uniqlo", "UNQ", "Japan"),
            ("Gap Inc.", "GAP", "USA"), ("PVH Corp", "PVH", "USA"),
            ("Inditex", "IND", "Spain"), ("M&S", "MNS", "UK"),
        ]
        for name, code, country in names:
            buyer = Buyer.objects.create(
                organization_id=ORG_ID, name=name, code=code,
                country=country, contact_person=fake.name(),
                email=f"procurement@{code.lower()}.com",
            )
            BuyerRating.objects.create(buyer=buyer, rating=self._dec(3, 5, 2), reviews_count=random.randint(10, 200))
            BuyerPortfolio.objects.create(
                buyer=buyer, active_orders=random.randint(2, 15),
                total_units=random.randint(5000, 200000),
                total_value=self._dec(50000, 5000000, 2),
            )

    # ── Styles ───────────────────────────────────────────────────────
    def _seed_styles(self):
        from buyers.models import Buyer
        from merchandising.models import Style
        if Style.objects.exists():
            return
        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        categories = ["T-Shirt", "Polo", "Denim Jacket", "Cargo Pant", "Shirt",
                       "Hoodie", "Dress Shirt", "Chino", "Blazer", "Sportswear",
                       "Sweater", "Jacket", "Shorts", "Tank Top", "Cardigan"]
        for i in range(1, 31):
            cat = random.choice(categories)
            Style.objects.create(
                organization_id=ORG_ID,
                buyer_id=random.choice(buyer_ids),
                name=f"{cat} - {fake.word().title()}",
                style_number=f"STY{2024}{i:03d}",
                description=fake.text(max_nb_chars=120),
                category=cat,
            )

    # ── Suppliers ────────────────────────────────────────────────────
    def _seed_suppliers(self):
        from procurement.models import Supplier
        if Supplier.objects.exists():
            return
        types = ["fabric", "fabric", "accessory", "trim", "general"]
        for i in range(1, 16):
            name = fake.company()[:50]
            Supplier.objects.create(
                organization_id=ORG_ID,
                name=name,
                code=f"SUP{i:03d}",
                contact_person=fake.name(),
                email=f"vendor{i}@supplier.com",
                phone=fake.phone_number()[:20],
                supplier_type=random.choice(types),
                rating=self._dec(2, 5, 2),
            )

    # ── Merchandising ────────────────────────────────────────────────
    def _seed_merchandising(self):
        from merchandising.models import (BuyerEnquiry, DevelopmentMonitoring,
                                           PurchaseOrder, SMVRecord, SampleOrder)
        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        style_ids = list(Style.objects.values_list("id", flat=True))

        # Purchase Orders
        for i in range(1, 51):
            buyer_id = random.choice(buyer_ids)
            style_id = random.choice(style_ids)
            qty = random.randint(500, 50000)
            up = self._dec(3, 50)
            po = PurchaseOrder.objects.create(
                organization_id=ORG_ID, buyer_id=buyer_id, style_id=style_id,
                po_number=f"PO{2025}{i:03d}",
                order_date=self._past_date(365),
                delivery_date=self._future_date(30) if i < 40 else self._past_date(30),
                quantity=qty, unit_price=up,
                total_value=Decimal(str(round(qty * float(up), 2))),
                status=weighted_choice([("draft", 1), ("confirmed", 3), ("in_production", 3),
                                         ("shipped", 2), ("delivered", 2), ("cancelled", 1)]),
            )

        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))

        # Enquiries
        for i in range(20):
            BuyerEnquiry.objects.create(
                organization_id=ORG_ID, buyer_id=random.choice(buyer_ids),
                style_id=random.choice(style_ids),
                enquiry_date=self._past_date(200),
                status=random.choice(["received", "under_review", "quoted", "converted", "lost"]),
                notes=fake.text(max_nb_chars=100),
            )

        # Sample Orders
        for i in range(25):
            SampleOrder.objects.create(
                organization_id=ORG_ID, buyer_id=random.choice(buyer_ids),
                style_id=random.choice(style_ids),
                sample_type=random.choice(["fit", "pp", "size_set", "pre_production", "photo", "shipping"]),
                quantity=random.randint(2, 50),
                request_date=self._past_date(180),
                deadline=self._future_date(10) if random.random() < 0.7 else self._past_date(30),
                status=random.choice(["requested", "in_progress", "submitted", "approved", "rejected"]),
            )

        # SMV Records
        for sid in random.sample(style_ids, min(15, len(style_ids))):
            SMVRecord.objects.create(
                style_id=sid, smv=self._dec(5, 60, 2),
                calculated_by=fake.name(),
                calculation_date=self._past_date(300),
            )

        # Development Monitoring
        for i in range(20):
            DevelopmentMonitoring.objects.create(
                style_id=random.choice(style_ids),
                supplier=fake.company()[:50],
                stage=random.choice(["Proto", "Size Set", "PP Sample", "TOP", "Bulk"]),
                start_date=self._past_date(200),
                completion_date=self._past_date(50) if random.random() < 0.6 else None,
                status=random.choice(["pending", "in_progress", "completed"]),
            )

    # ── IE Planning ──────────────────────────────────────────────────
    def _seed_ie_planning(self):
        from ie_planning.models import (CapacityBooking, LinePlan, ProductionPlan,
                                         RiskAssessment, StyleAnalysis)
        style_ids = list(Style.objects.values_list("id", flat=True))
        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))
        lines = ["Line-1", "Line-2", "Line-3", "Line-4", "Line-5"]

        for i in range(15):
            CapacityBooking.objects.create(
                organization_id=ORG_ID, style_id=random.choice(style_ids),
                line=random.choice(lines),
                capacity_per_day=random.randint(800, 3000),
                booking_date=self._past_date(180),
                allocated_days=random.randint(5, 30),
                status=random.choice(["allocated", "in_use", "released"]),
            )
        for i in range(12):
            LinePlan.objects.create(
                organization_id=ORG_ID, style_id=random.choice(style_ids),
                line=random.choice(lines), plan_date=self._past_date(90),
                target_quantity=random.randint(2000, 50000),
                status=random.choice(["planned", "running", "completed"]),
            )
        for i in range(15):
            sid = random.choice(style_ids)
            pid = random.choice(po_ids) if po_ids else None
            ProductionPlan.objects.create(
                organization_id=ORG_ID, purchase_order_id=pid,
                style_id=sid, planned_start_date=self._past_date(60),
                planned_end_date=self._future_date(15),
                daily_target=random.randint(500, 3000),
                total_quantity=random.randint(5000, 100000),
                status=random.choice(["draft", "approved", "in_progress", "completed", "on_hold"]),
            )

        risk_types = ["Fabric Delay", "Labor Shortage", "Machine Breakdown", "Quality Issue", "Power Outage"]
        for i in range(10):
            RiskAssessment.objects.create(
                organization_id=ORG_ID, style_id=random.choice(style_ids),
                risk_type=random.choice(risk_types),
                severity=random.choice(["low", "medium", "high", "critical"]),
                likelihood=random.choice(["low", "medium", "high"]),
                mitigation_plan=fake.text(max_nb_chars=150),
                status=random.choice(["open", "mitigated", "closed"]),
            )
        for i in range(8):
            StyleAnalysis.objects.create(
                style_id=random.choice(style_ids),
                analysis_type=random.choice(["cost", "feasibility", "market", "production"]),
                findings=fake.text(max_nb_chars=200),
                recommendation=fake.text(max_nb_chars=150),
                analyzed_by=fake.name(),
                analysis_date=self._past_date(250),
            )

    # ── Production Lines ─────────────────────────────────────────────
    def _seed_production_lines(self):
        from production.models import ProductionLine
        if ProductionLine.objects.exists():
            return
        for i in range(1, 11):
            ProductionLine.objects.create(
                organization_id=ORG_ID,
                name=f"Line-{i}",
                code=f"L{i:02d}",
                location=f"Floor-{(i - 1) // 5 + 1}",
                capacity=random.randint(1500, 4000),
            )

    # ── Inventory ────────────────────────────────────────────────────
    def _seed_inventory(self):
        from inventory.models import (Accessory, Fabric, PhysicalInventory,
                                       ShadeApproval, StockMovement, Trim, Warehouse)
        if Warehouse.objects.exists():
            return

        w1 = Warehouse.objects.create(organization_id=ORG_ID, name="Main Fabric Store", code="WH-FAB", location="Floor-1")
        w2 = Warehouse.objects.create(organization_id=ORG_ID, name="Accessory Store", code="WH-ACC", location="Floor-2")
        w3 = Warehouse.objects.create(organization_id=ORG_ID, name="Trim Store", code="WH-TRM", location="Floor-2")
        wh_ids = [w1.id, w2.id, w3.id]

        fabrics = [
            ("100% Cotton Single Jersey", "FAB001", "cotton jersey", "White", 12000),
            ("Cotton-Polyester Blend", "FAB002", "blend", "Black", 8500),
            ("100% Cotton French Terry", "FAB003", "french terry", "Navy", 6000),
            ("Cotton Lycra", "FAB004", "lycra", "Grey", 4500),
            ("Pique Knit", "FAB005", "pique", "Red", 3200),
            ("Interlock Knit", "FAB006", "interlock", "Blue", 2800),
            ("Rib Knit", "FAB007", "rib", "Green", 1500),
            ("Denim 10oz", "FAB008", "denim", "Indigo", 9000),
            ("Denim 12oz", "FAB009", "denim", "Black", 7000),
            ("Oxford Fabric", "FAB010", "oxford", "White", 4000),
            ("Twill Fabric", "FAB011", "twill", "Khaki", 3500),
            ("Satin", "FAB012", "satin", "Burgundy", 1800),
            ("Polyester Mesh", "FAB013", "mesh", "Black", 2200),
            ("Fleece", "FAB014", "fleece", "Charcoal", 5000),
            ("Brushed Back Fleece", "FAB015", "fleece", "Navy", 6500),
        ]
        for name, code, comp, color, qty in fabrics:
            Fabric.objects.create(
                organization_id=ORG_ID, warehouse_id=w1.id,
                name=name, code=code, color=color,
                composition=comp, width=self._dec(44, 60),
                quantity=qty, unit="meters",
                threshold_quantity=random.randint(200, 1000),
                unit_price=self._dec(1.5, 8, 2),
            )

        accessories = [
            ("Button 18L", "ACC001", "Button", 50000), ("Button 24L", "ACC002", "Button", 35000),
            ("YKK Zipper #5", "ACC003", "Zipper", 20000), ("YKK Zipper #3", "ACC004", "Zipper", 15000),
            ("Metal Button", "ACC005", "Button", 25000), ("Snap Button", "ACC006", "Button", 30000),
            ("Hanger Plastic", "ACC007", "Hanger", 10000), ("Hanger Wooden", "ACC008", "Hanger", 5000),
            ("Poly Bag S", "ACC009", "Poly Bag", 8000), ("Poly Bag M", "ACC010", "Poly Bag", 12000),
            ("Size Label", "ACC011", "Label", 100000), ("Care Label", "ACC012", "Label", 80000),
            ("Main Label Woven", "ACC013", "Label", 50000), ("Price Ticket", "ACC014", "Ticket", 60000),
            ("Elastic Band 1in", "ACC015", "Elastic", 15000),
        ]
        for name, code, cat, qty in accessories:
            Accessory.objects.create(
                organization_id=ORG_ID, warehouse_id=w2.id,
                name=name, code=code, category=cat, quantity=qty,
                unit="pcs", threshold_quantity=random.randint(500, 3000),
                unit_price=self._dec(0.01, 0.5, 2),
            )

        trims = [
            ("Sewing Thread White", "TRM001", 200), ("Sewing Thread Black", "TRM002", 180),
            ("Fusing 20g", "TRM003", 100), ("Fusing 30g", "TRM004", 80),
            ("Drawstring 3mm", "TRM005", 50), ("Drawstring 5mm", "TRM006", 40),
        ]
        for name, code, qty in trims:
            Trim.objects.create(
                organization_id=ORG_ID, warehouse_id=w3.id,
                name=name, code=code, quantity=qty * 100,
                unit="rolls", threshold_quantity=random.randint(5, 20),
                unit_price=self._dec(0.5, 3, 2),
            )

        fabric_ids = list(Fabric.objects.values_list("id", flat=True))
        for fid in fabric_ids[:8]:
            ShadeApproval.objects.create(
                fabric_id=fid, shade_name=fake.color_name(),
                shade_code=f"SHD{fid:03d}",
                approved_by=fake.name(),
                approval_date=self._past_date(200),
                status=random.choice(["pending", "approved", "rejected"]),
            )

        for i in range(20):
            StockMovement.objects.create(
                organization_id=ORG_ID,
                item_type=random.choice(["fabric", "accessory", "trim"]),
                item_id=random.choice(fabric_ids + [1, 2, 3, 4, 5]),
                from_warehouse_id=random.choice(wh_ids),
                to_warehouse_id=random.choice(wh_ids),
                movement_type=random.choice(["in", "out", "transfer"]),
                quantity=random.randint(50, 2000),
                reference_number=f"REF{i:04d}",
                created_by=fake.name(),
            )

        for i in range(5):
            PhysicalInventory.objects.create(
                warehouse_id=random.choice(wh_ids),
                inventory_date=self._past_date(90),
                status=random.choice(["draft", "in_progress", "completed", "verified"]),
                created_by=fake.name(),
            )

    # ── Procurement ──────────────────────────────────────────────────
    def _seed_procurement(self):
        from procurement.models import RawMaterialBooking, RawMaterialRequisition
        supplier_ids = list(Supplier.objects.values_list("id", flat=True))

        for i in range(1, 21):
            RawMaterialRequisition.objects.create(
                organization_id=ORG_ID,
                requisition_number=f"REQ{i:04d}",
                item_type=random.choice(["fabric", "accessory", "trim"]),
                item_id=random.randint(1, 15),
                quantity=random.randint(500, 10000),
                required_date=self._past_date(30),
                status=random.choice(["draft", "pending_approval", "approved", "ordered", "received"]),
                requested_by=fake.name(),
                approved_by=fake.name() if random.random() > 0.3 else "",
            )

        for i in range(1, 21):
            qty = random.randint(1000, 50000)
            up = self._dec(1, 10)
            RawMaterialBooking.objects.create(
                organization_id=ORG_ID,
                supplier_id=random.choice(supplier_ids),
                booking_number=f"BK{i:04d}",
                booking_date=self._past_date(120),
                expected_delivery_date=self._future_date(15) if i < 15 else self._past_date(30),
                item_type=random.choice(["fabric", "accessory", "trim"]),
                item_id=random.randint(1, 15),
                quantity=qty,
                unit_price=up,
                total_value=Decimal(str(round(qty * float(up), 2))),
                status=random.choice(["draft", "confirmed", "partial_received", "received"]),
            )

    def _seed_quotation_analyses(self):
        from procurement.models import QuotationAnalysis
        if QuotationAnalysis.objects.exists():
            return
        supplier_ids = list(Supplier.objects.values_list("id", flat=True))
        for i in range(1, 21):
            QuotationAnalysis.objects.create(
                organization_id=ORG_ID,
                supplier_id=random.choice(supplier_ids),
                item_type=random.choice(["Fabric - 100% Cotton", "Polyester", "Buttons", "Zippers", "Labels", "Threads"]),
                quantity=random.randint(500, 30000),
                quoted_price=self._dec(0.1, 8),
                delivery_terms=random.choice(["Ex-Factory", "FOB Chittagong", "CIF Chittagong"]),
                payment_terms=random.choice(["Cash on Delivery", "Net 30", "LC at Sight", "Advance Payment"]),
                validity_date=self._future_date(45),
                status=random.choice(["pending", "accepted", "rejected", "negotiating"]),
                notes=fake.text(max_nb_chars=80),
            )

    # ── Defect Categories ────────────────────────────────────────────
    def _seed_defect_categories(self):
        from quality.models import DefectCategory
        if DefectCategory.objects.exists():
            return
        defects = [
            ("Hole", "DEF-HL"), ("Stain", "DEF-ST"), ("Color Shade Variation", "DEF-CSV"),
            ("Stitching Defect", "DEF-SD"), ("Fabric Slub", "DEF-FS"), ("Misprint", "DEF-MP"),
            ("Needle Cut", "DEF-NC"), ("Size Variation", "DEF-SV"), ("Improper Fusing", "DEF-IF"),
            ("Open Seam", "DEF-OS"), ("Pilling", "DEF-PL"), ("Uneven Hem", "DEF-UH"),
            ("Button Defect", "DEF-BD"), ("Zipper Defect", "DEF-ZD"), ("Label Defect", "DEF-LD"),
        ]
        for name, code in defects:
            DefectCategory.objects.create(
                organization_id=ORG_ID, name=name, code=code,
                description=fake.text(max_nb_chars=80),
            )

    # ── Production ───────────────────────────────────────────────────
    def _seed_production(self):
        from production.models import (CuttingRecord, FloorRequisition,
                                        InspectionPacking, ProductionOrder,
                                        SewingRecord)
        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))
        style_ids = list(Style.objects.values_list("id", flat=True))
        line_ids = list(ProductionLine.objects.values_list("id", flat=True))

        for i in range(1, 26):
            purchased_order_id = random.choice(po_ids) if po_ids else None
            style_id = random.choice(style_ids)
            order = ProductionOrder.objects.create(
                organization_id=ORG_ID,
                purchase_order_id=purchased_order_id,
                style_id=style_id,
                production_line_id=random.choice(line_ids) if random.random() > 0.3 else None,
                order_number=f"PROD{i:04d}",
                quantity=random.randint(5000, 50000),
                start_date=self._past_date(120),
                end_date=self._future_date(5) if random.random() > 0.3 else None,
                status=random.choice(["pending", "released", "in_progress", "completed", "on_hold"]),
            )

        prod_order_ids = list(ProductionOrder.objects.values_list("id", flat=True))
        for poid in prod_order_ids:
            for _ in range(random.randint(1, 4)):
                qty_cut = random.randint(500, 8000)
                CuttingRecord.objects.create(
                    production_order_id=poid,
                    date=self._past_date(60),
                    quantity_cut=qty_cut,
                    fabric_used=self._dec(100, 2000, 2),
                    waste_quantity=self._dec(5, 100, 2),
                )
            for _ in range(random.randint(1, 5)):
                out = random.randint(300, 5000)
                SewingRecord.objects.create(
                    production_order_id=poid,
                    production_line_id=random.choice(line_ids),
                    date=self._past_date(60),
                    input_quantity=out + random.randint(0, 100),
                    output_quantity=out,
                    defect_quantity=random.randint(0, 50),
                    efficiency=self._dec(50, 98, 2),
                )
            for _ in range(random.randint(1, 3)):
                inspected = random.randint(1000, 8000)
                passed = int(inspected * random.uniform(0.85, 0.99))
                InspectionPacking.objects.create(
                    production_order_id=poid,
                    date=self._past_date(60),
                    inspected_quantity=inspected,
                    passed_quantity=passed,
                    failed_quantity=inspected - passed,
                    packed_quantity=random.randint(500, 5000),
                )
            for _ in range(random.randint(0, 3)):
                FloorRequisition.objects.create(
                    production_order_id=poid,
                    item_type=random.choice(["fabric", "thread", "zipper", "button", "label"]),
                    quantity_requested=random.randint(50, 500),
                    quantity_approved=random.choice([None, random.randint(50, 500)]),
                    request_date=self._past_date(60),
                    status=random.choice(["pending", "approved", "rejected", "issued"]),
                )

    # ── Quality ──────────────────────────────────────────────────────
    def _seed_quality(self):
        from quality.models import (EndLineQC, FabricInspection, FinalInspection,
                                     InlineQC, RejectionReport)
        defect_ids = list(DefectCategory.objects.values_list("id", flat=True))
        prod_order_ids = list(ProductionOrder.objects.values_list("id", flat=True))

        for i in range(20):
            FabricInspection.objects.create(
                organization_id=ORG_ID,
                fabric_received_from=fake.company()[:50],
                supplier=fake.company()[:50],
                inspection_date=self._past_date(120),
                total_quantity=self._dec(1000, 20000, 2),
                inspected_quantity=self._dec(500, 10000, 2),
                passed_quantity=self._dec(400, 9500, 2),
                rejected_quantity=self._dec(0, 500, 2),
                defect_category_id=random.choice(defect_ids) if random.random() > 0.3 else None,
                status=random.choice(["pending", "passed", "failed", "conditional"]),
                inspected_by=fake.name(),
            )

        for poid in prod_order_ids[:15]:
            for _ in range(random.randint(1, 3)):
                checked = random.randint(200, 3000)
                defects = random.randint(0, int(checked * 0.05))
                InlineQC.objects.create(
                    production_order_id=poid,
                    production_line=f"Line-{random.randint(1, 10)}",
                    check_date=self._past_date(60),
                    checked_quantity=checked,
                    defect_quantity=defects,
                    defect_category_id=random.choice(defect_ids) if defect_ids else None,
                    defect_description=fake.text(max_nb_chars=80),
                    action_taken=fake.text(max_nb_chars=80),
                    status=random.choice(["pass", "fail", "rework"]),
                    checked_by=fake.name(),
                )
            for _ in range(random.randint(1, 2)):
                EndLineQC.objects.create(
                    production_order_id=poid,
                    check_date=self._past_date(60),
                    checked_quantity=random.randint(500, 5000),
                    passed_quantity=random.randint(400, 4800),
                    failed_quantity=random.randint(0, 200),
                    defect_category_id=random.choice(defect_ids) if defect_ids else None,
                    status=random.choice(["pass", "fail", "rework"]),
                    checked_by=fake.name(),
                )
            for _ in range(random.randint(0, 2)):
                RejectionReport.objects.create(
                    production_order_id=poid,
                    report_date=self._past_date(60),
                    stage=random.choice(["cutting", "sewing", "washing", "finishing", "packing"]),
                    rejected_quantity=random.randint(1, 100),
                    defect_category_id=random.choice(defect_ids) if defect_ids else None,
                    defect_details=fake.text(max_nb_chars=100),
                    corrective_action=fake.text(max_nb_chars=100) if random.random() > 0.3 else "",
                    reported_by=fake.name(),
                )

            FinalInspection.objects.create(
                production_order_id=poid,
                inspection_date=self._past_date(30),
                inspected_quantity=random.randint(1000, 10000),
                passed_quantity=random.randint(900, 9500),
                failed_quantity=random.randint(0, 500),
                aql_level="2.5",
                critical_defects=random.randint(0, 5),
                major_defects=random.randint(0, 20),
                minor_defects=random.randint(0, 50),
                status=random.choice(["pass", "fail", "conditional"]),
                inspected_by=fake.name(),
            )

    # ── Subcontract ──────────────────────────────────────────────────
    def _seed_subcontract(self):
        from subcontract.models import SubcontractOrder, SubcontractTracking
        style_ids = list(Style.objects.values_list("id", flat=True))
        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))

        for i in range(1, 13):
            qty = random.randint(2000, 30000)
            rate = self._dec(0.5, 5)
            order = SubcontractOrder.objects.create(
                organization_id=ORG_ID,
                style_id=random.choice(style_ids),
                purchase_order_id=random.choice(po_ids) if random.random() > 0.3 else None,
                order_number=f"SUB{i:04d}",
                subcontractor_name=fake.company()[:50],
                process=random.choice(["cutting", "sewing", "washing", "embroidery", "printing", "finishing", "packing"]),
                quantity=qty,
                rate=rate,
                total_value=Decimal(str(round(qty * float(rate), 2))),
                start_date=self._past_date(90),
                expected_completion=self._future_date(15),
                actual_completion=self._future_date(5) if random.random() > 0.5 else None,
                status=random.choice(["pending", "in_progress", "completed", "delayed"]),
            )
            for _ in range(random.randint(1, 3)):
                qty_rec = random.randint(500, 5000)
                SubcontractTracking.objects.create(
                    subcontract_order_id=order.id,
                    tracking_date=self._past_date(30),
                    quantity_received=qty_rec,
                    quantity_passed=int(qty_rec * random.uniform(0.85, 1)),
                    quantity_rejected=random.randint(0, int(qty_rec * 0.05)),
                    status=random.choice(["received", "inspected", "approved", "rejected"]),
                )

    # ── Accounts ─────────────────────────────────────────────────────
    def _seed_cost_centers(self):
        from accounts.models import CostCenter
        if CostCenter.objects.exists():
            return
        centers = [
            ("Cutting Department", "CC-CUT", "Cutting"),
            ("Sewing Department", "CC-SEW", "Sewing"),
            ("Finishing Department", "CC-FIN", "Finishing"),
            ("Quality Control", "CC-QC", "Quality"),
            ("Administration", "CC-ADMIN", "Admin"),
            ("HR & Payroll", "CC-HR", "HR"),
            ("Marketing & Sales", "CC-MKT", "Merchandising"),
            ("Warehouse & Logistics", "CC-WH", "Logistics"),
            ("IT Department", "CC-IT", "IT"),
            ("Maintenance", "CC-MNT", "Maintenance"),
        ]
        for name, code, dept in centers:
            CostCenter.objects.create(
                organization_id=ORG_ID, name=name, code=code,
                department=dept, budget=self._dec(50000, 5000000, 2),
            )

    def _seed_chart_of_accounts(self):
        from accounts.models import ChartOfAccount
        if ChartOfAccount.objects.exists():
            return
        accounts = [
            ("1001", "Cash & Bank", "asset"), ("1101", "Accounts Receivable", "asset"),
            ("1201", "Inventory", "asset"), ("1301", "Fixed Assets", "asset"),
            ("2001", "Accounts Payable", "liability"), ("2101", "Accrued Expenses", "liability"),
            ("2201", "Short Term Loan", "liability"), ("3001", "Share Capital", "equity"),
            ("3101", "Retained Earnings", "equity"), ("4001", "Revenue", "revenue"),
            ("4101", "Export Sales", "revenue"), ("5001", "COGS", "expense"),
            ("5101", "Salaries", "expense"), ("5201", "Utilities", "expense"),
            ("5301", "Rent & Lease", "expense"), ("5401", "Admin Expenses", "expense"),
            ("5501", "Depreciation", "expense"), ("5601", "Transportation", "expense"),
        ]
        parent_map = {}
        for code, name, atype in accounts:
            parent = parent_map.get(atype) if atype in ["expense", "revenue"] else None
            acc = ChartOfAccount.objects.create(
                organization_id=ORG_ID, account_code=code,
                account_name=name, account_type=atype,
                parent_id=parent,
            )
            if atype not in parent_map:
                parent_map[atype] = acc.id

    def _seed_accounts(self):
        from accounts.models import (AccountsPayable, AccountsReceivable,
                                      Expense, JournalEntry)
        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        supplier_ids = list(Supplier.objects.values_list("id", flat=True))
        coa_ids = list(ChartOfAccount.objects.values_list("id", flat=True))
        cc_ids = list(CostCenter.objects.values_list("id", flat=True))

        for i in range(1, 21):
            amount = self._dec(5000, 500000)
            paid = self._dec(0, float(amount))
            AccountsPayable.objects.create(
                organization_id=ORG_ID,
                supplier_id=random.choice(supplier_ids),
                invoice_number=f"AP-INV-{i:04d}",
                invoice_date=self._past_date(120),
                due_date=self._future_date(10),
                amount=amount, paid_amount=paid, balance=amount - paid,
                status=random.choice(["pending", "partial", "paid", "overdue"]),
            )
        for i in range(1, 21):
            amount = self._dec(10000, 1000000)
            recv = self._dec(0, float(amount))
            AccountsReceivable.objects.create(
                organization_id=ORG_ID,
                buyer_id=random.choice(buyer_ids),
                invoice_number=f"AR-INV-{i:04d}",
                invoice_date=self._past_date(120),
                due_date=self._future_date(10),
                amount=amount, received_amount=recv, balance=amount - recv,
                status=random.choice(["pending", "partial", "received", "overdue"]),
            )
        for i in range(1, 31):
            Expense.objects.create(
                organization_id=ORG_ID,
                cost_center_id=random.choice(cc_ids) if random.random() > 0.3 else None,
                expense_date=self._past_date(120),
                category=random.choice(["utilities", "salary", "rent", "maintenance", "travel", "office", "raw_material"]),
                description=fake.text(max_nb_chars=80),
                amount=self._dec(500, 200000),
                status=random.choice(["draft", "pending", "approved", "rejected"]),
                created_by=fake.name(),
            )
        for i in range(1, 41):
            JournalEntry.objects.create(
                organization_id=ORG_ID,
                entry_number=f"JE{i:04d}",
                entry_date=self._past_date(120),
                description=fake.text(max_nb_chars=100),
                account_id=random.choice(coa_ids),
                debit=self._dec(100, 50000) if random.random() > 0.5 else Decimal("0"),
                credit=Decimal("0") if random.random() > 0.5 else self._dec(100, 50000),
                created_by=fake.name(),
            )

    # ── Commercial ───────────────────────────────────────────────────
    def _seed_commercial(self):
        from commercial.models import BillOfExchange, Invoice, LetterOfCredit, Shipment
        from core.models import Currency
        from orders.models import Order
        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        supplier_ids = list(Supplier.objects.values_list("id", flat=True))
        order_ids = list(Order.objects.values_list("id", flat=True))
        usd_id = Currency.objects.filter(code="USD").values_list("id", flat=True).first()

        for i in range(1, 13):
            LetterOfCredit.objects.create(
                organization_id=ORG_ID, buyer_id=random.choice(buyer_ids),
                supplier_id=random.choice(supplier_ids),
                lc_number=f"LC{2025}{i:04d}",
                lc_type=random.choice(["export", "import", "btb"]),
                amount=self._dec(50000, 2000000),
                currency_id=usd_id,
                issue_date=self._past_date(180),
                expiry_date=self._future_date(30) if random.random() > 0.5 else self._past_date(30),
                bank_name=random.choice(["HSBC", "Standard Chartered", "City Bank", "Sonali Bank", "Dutch Bangla"]),
                status=random.choice(["draft", "issued", "amended", "expired"]),
                amendment_count=random.randint(0, 3),
            )
        for i in range(1, 16):
            Shipment.objects.create(
                organization_id=ORG_ID,
                purchase_order_id=random.choice(order_ids),
                buyer_id=random.choice(buyer_ids),
                supplier_id=random.choice(supplier_ids),
                shipment_number=f"SHP{i:04d}",
                direction=random.choice(["import", "export"]),
                shipment_type=random.choice(["sea", "air", "land"]),
                shipment_date=self._past_date(90),
                etd=self._past_date(85), eta=self._future_date(10),
                port_of_loading=random.choice(["Chittagong", "Dhaka ICD", "Mongla"]),
                port_of_discharge=random.choice(["Rotterdam", "Hamburg", "New York", "Southampton", "Barcelona", "Los Angeles"]),
                forwarder=random.choice(["Maersk", "MSC", "CMA CGM", "Evergreen", "COSCO"]),
                carrier=random.choice(["Maersk", "MSC", "CMA CGM", "Evergreen", "COSCO"]),
                container_number=f"MAEU{random.randint(1000000, 9999999)}",
                container_size=random.choice(["20ft", "40ft", "40hq"]),
                gross_weight=self._dec(1000, 25000, 2),
                net_weight=self._dec(900, 23000, 2),
                volume_cbm=self._dec(10, 80, 3),
                status=random.choice(["booked", "loaded", "shipped", "in_transit", "arrived", "delivered"]),
                clearance_status=random.choice(["pending", "in_progress", "cleared"]),
            )
        for i in range(1, 16):
            amount = self._dec(10000, 500000)
            Invoice.objects.create(
                organization_id=ORG_ID,
                purchase_order_id=random.choice(order_ids),
                buyer_id=random.choice(buyer_ids),
                supplier_id=random.choice(supplier_ids),
                invoice_number=f"CML-INV-{i:04d}",
                invoice_date=self._past_date(90),
                due_date=self._future_date(15),
                amount=amount,
                currency_id=usd_id,
                paid_amount=amount if random.random() > 0.5 else self._dec(0, 50000),
                status=random.choice(["draft", "submitted", "approved", "paid", "partial", "overdue"]),
                payment_terms=random.choice(["Net 30", "Net 60", "LC at Sight"]),
            )
        for i in range(1, 11):
            BillOfExchange.objects.create(
                organization_id=ORG_ID, buyer_id=random.choice(buyer_ids),
                bill_number=f"BOE{i:04d}",
                bank_name=random.choice(["HSBC", "Standard Chartered", "City Bank"]),
                issue_date=self._past_date(120),
                maturity_date=self._future_date(15) if random.random() > 0.5 else self._past_date(30),
                amount=self._dec(20000, 300000),
                currency_id=usd_id,
                status=random.choice(["draft", "submitted", "under_review", "accepted", "negotiated", "paid"]),
            )

    # ── CRM ──────────────────────────────────────────────────────────
    def _seed_crm(self):
        from crm.models import (BuyerCommunication, BuyerProfitability,
                                 OrderAmendmentHistory)
        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))

        for i in range(30):
            BuyerCommunication.objects.create(
                organization_id=ORG_ID, buyer_id=random.choice(buyer_ids),
                communication_type=random.choice(["email", "phone", "meeting", "site_visit", "video_call"]),
                subject=fake.sentence()[:50],
                content=fake.text(max_nb_chars=200),
                contact_person=fake.name(),
                communication_date=datetime.now() - timedelta(days=random.randint(1, 180)),
                follow_up_date=self._past_date(30) if random.random() > 0.6 else None,
                status=random.choice(["completed", "pending_follow_up", "closed"]),
                created_by=fake.name(),
            )

        for bid in buyer_ids:
            start = self._past_date(400)
            end = start + timedelta(days=90)
            rev = self._dec(50000, 2000000)
            cost = self._dec(30000, 1500000)
            profit = rev - cost
            margin = Decimal(str(round(float(profit) / float(rev) * 100, 2))) if rev else Decimal("0")
            BuyerProfitability.objects.create(
                buyer_id=bid, period_start=start, period_end=end,
                total_revenue=rev, total_cost=cost,
                profit=profit, profit_margin=margin,
            )

        for i in range(12):
            prev = fake.text(max_nb_chars=60)
            new = fake.text(max_nb_chars=60)
            OrderAmendmentHistory.objects.create(
                purchase_order_id=random.choice(po_ids),
                amendment_date=self._past_date(120),
                previous_value=prev, new_value=new,
                reason=fake.text(max_nb_chars=100),
                amended_by=fake.name(),
            )

    # ── HR Details ──────────────────────────────────────────────────
    def _seed_hr_details(self):
        from hr.models import Attendance, Bonus, Leave, Overtime, SalarySheet
        emp_ids = list(Employee.objects.values_list("id", flat=True))

        for eid in emp_ids[:30]:
            used_dates = set()
            for _ in range(random.randint(5, 20)):
                for attempt in range(50):
                    d = self._past_date(120)
                    if d not in used_dates:
                        used_dates.add(d)
                        break
                Attendance.objects.create(
                    employee_id=eid, date=d,
                    check_in=datetime.strptime(f"{random.randint(7, 9):02d}:{random.randint(0, 59):02d}", "%H:%M").time(),
                    check_out=datetime.strptime(f"{random.randint(17, 20):02d}:{random.randint(0, 59):02d}", "%H:%M").time(),
                    status=weighted_choice([("present", 8), ("absent", 1), ("late", 1), ("half_day", 0.5), ("leave", 0.5)]),
                )

        for eid in emp_ids[:20]:
            for _ in range(random.randint(0, 3)):
                sd = self._past_date(200)
                ed = sd + timedelta(days=random.randint(1, 5))
                Leave.objects.create(
                    employee_id=eid,
                    leave_type=random.choice(["annual", "sick", "personal", "maternity", "paternity", "unpaid"]),
                    start_date=sd, end_date=ed,
                    total_days=(ed - sd).days + 1,
                    reason=fake.text(max_nb_chars=80),
                    status=random.choice(["pending", "approved", "rejected", "cancelled"]),
                    approved_by=fake.name() if random.random() > 0.3 else "",
                )

        for eid in emp_ids[:25]:
            for _ in range(random.randint(0, 5)):
                hrs = self._dec(1, 4, 1)
                rate = self._dec(50, 200)
                Overtime.objects.create(
                    employee_id=eid, date=self._past_date(60),
                    hours=hrs, rate=rate,
                    total_amount=Decimal(str(round(float(hrs) * float(rate), 2))),
                    status=random.choice(["pending", "approved", "paid"]),
                    approved_by=fake.name() if random.random() > 0.5 else "",
                )

        for eid in emp_ids:
            for offset in range(0, 6):
                base = self._dec(5000, 50000)
                allowances = self._dec(500, 10000)
                deductions = self._dec(200, 5000)
                ot = self._dec(0, 3000)
                bonus = self._dec(0, 5000) if random.random() < 0.3 else Decimal("0")
                net = base + allowances + ot + bonus - deductions
                month_d = date.today() - timedelta(days=offset * 30)
                SalarySheet.objects.create(
                    organization_id=ORG_ID, employee_id=eid,
                    month=month_d.strftime("%Y-%m"),
                    basic_salary=base, allowances=allowances,
                    deductions=deductions, overtime_amount=ot,
                    bonus_amount=bonus, net_salary=max(net, Decimal("0")),
                    status=random.choice(["draft", "approved", "paid"]),
                    payment_date=self._past_date(10) if random.random() > 0.3 else None,
                )

        for eid in emp_ids[:20]:
            for _ in range(random.randint(0, 2)):
                Bonus.objects.create(
                    employee_id=eid,
                    bonus_type=random.choice(["festival", "performance", "attendance", "special"]),
                    amount=self._dec(1000, 20000),
                    bonus_date=self._past_date(200),
                    description=fake.text(max_nb_chars=60),
                    status=random.choice(["approved", "paid"]),
                )

    # ── Fixed Assets ─────────────────────────────────────────────────
    def _seed_fixed_assets(self):
        from fixed_assets.models import AssetCategory, DepreciationSchedule, FixedAsset
        if AssetCategory.objects.exists():
            return
        cats_data = [
            ("Machinery", "MAC", "straight_line", 10),
            ("IT Equipment", "IT", "declining", 4),
            ("Furniture", "FUR", "straight_line", 7),
            ("Vehicles", "VEH", "declining", 8),
            ("Building", "BLD", "straight_line", 30),
            ("Office Equipment", "OFF", "straight_line", 5),
        ]
        for name, code, dep_method, life in cats_data:
            AssetCategory.objects.create(
                organization_id=ORG_ID, name=name, code=code,
                description=fake.text(max_nb_chars=80),
                depreciation_method=dep_method, useful_life_years=life,
            )

        cat_ids = list(AssetCategory.objects.values_list("id", flat=True))
        asset_names = [
            ("CNC Cutting Machine", "FA001", 500000), ("Overlock Machine", "FA002", 250000),
            ("Flat Sewing Machine", "FA003", 150000), ("Button Attach Machine", "FA004", 80000),
            ("Ironing Table", "FA005", 30000), ("Compressor 50HP", "FA006", 200000),
            ("Generator 100KVA", "FA007", 800000), ("Forklift", "FA008", 350000),
            ("Server Rack", "FA009", 50000), ("Workstation PC", "FA010", 40000),
            ("Air Conditioner 3Ton", "FA011", 60000), ("Fire Extinguisher System", "FA012", 100000),
            ("CCTV System", "FA013", 45000), ("Water Treatment Plant", "FA014", 300000),
            ("Boiler", "FA015", 600000),
        ]
        for name, code, cost in asset_names:
            sv = Decimal(str(round(cost * 0.05)))
            dep = Decimal(str(round(cost * 0.1)))
            asset = FixedAsset.objects.create(
                organization_id=ORG_ID,
                category_id=random.choice(cat_ids),
                location_id=random.choice([1, 2, 3]),
                asset_code=code, name=name,
                purchase_date=self._past_date(1500),
                purchase_cost=cost, current_value=cost - dep,
                salvage_value=sv, depreciation_amount=dep,
                status=random.choice(["active", "active", "active", "under_maintenance"]),
            )
            for y in range(1, 6):
                ov = cost - dep * (y - 1)
                d = dep
                cv = ov - d
                if cv < 0:
                    cv = Decimal("0")
                DepreciationSchedule.objects.create(
                    fixed_asset_id=asset.id, year=2020 + y,
                    period=f"FY{2020 + y}",
                    opening_value=Decimal(str(max(ov, 0))) if ov > 0 else Decimal("0"),
                    depreciation=Decimal(str(min(d, float(ov)))),
                    closing_value=Decimal(str(max(cv, 0))),
                )

    # ── TNA ──────────────────────────────────────────────────────────
    def _seed_tna(self):
        from tna.models import JobOrder, Task, Timeline
        from merchandising.models import PurchaseOrder

        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))
        style_ids = list(Style.objects.values_list("id", flat=True))

        milestones = [
            "Fabric Booking", "Fabric Received", "Cutting Start", "Sewing Start",
            "Finishing Start", "Inspection", "Packing", "Shipment",
        ]
        task_ids = []
        for i in range(1, 26):
            sid = random.choice(style_ids)
            pid = random.choice(po_ids) if po_ids else None
            sd = self._past_date(120)
            ed = sd + timedelta(days=random.randint(15, 60))
            task = Task.objects.create(
                organization_id=ORG_ID,
                purchase_order_id=pid,
                style_id=sid,
                title=f"Production TNA - {fake.word().title()}",
                description=fake.text(max_nb_chars=120),
                assigned_to=fake.name(),
                start_date=sd, end_date=ed,
                duration_days=(ed - sd).days,
                priority=random.choice(["low", "medium", "high", "critical"]),
                status=random.choice(["not_started", "in_progress", "completed", "delayed"]),
                progress=random.randint(0, 100),
            )
            task_ids.append(task.id)

            for j in range(random.randint(0, 3)):
                JobOrder.objects.create(
                    organization_id=ORG_ID, task_id=task.id,
                    job_order_number=f"JO{2025}{i:03d}-{j}",
                    description=fake.text(max_nb_chars=80),
                    assigned_department=random.choice(["Cutting", "Sewing", "Finishing", "QC"]),
                    assigned_person=fake.name(),
                    start_date=self._past_date(100),
                    end_date=self._future_date(5),
                    status=random.choice(["pending", "in_progress", "completed", "delayed"]),
                )

            for milestone in random.sample(milestones, random.randint(2, 5)):
                pd = self._past_date(120)
                Timeline.objects.create(
                    organization_id=ORG_ID,
                    purchase_order_id=pid if pid else 1,
                    style_id=sid,
                    milestone=milestone,
                    planned_date=pd,
                    actual_date=pd + timedelta(days=random.randint(-5, 10)),
                    status=random.choice(["on_track", "delayed", "completed"]),
                )

    def _seed_alarm_notifications(self):
        from tna.models import AlarmNotification, Task
        if AlarmNotification.objects.exists():
            return
        task_ids = list(Task.objects.values_list("id", flat=True))
        for i in range(1, 21):
            task_id = random.choice(task_ids) if task_ids else None
            scheduled = timezone.now() + timedelta(days=random.randint(-10, 15))
            AlarmNotification.objects.create(
                organization_id=ORG_ID,
                task_id=task_id,
                alarm_type=random.choice(["sms", "email", "in_app"]),
                recipient=fake.email(),
                message=f"Reminder: Task deadline approaching - {fake.sentence(nb_words=8)}",
                scheduled_at=scheduled,
                sent_at=scheduled if random.random() > 0.3 else None,
                status=random.choice(["scheduled", "sent", "failed"]),
            )

    # ── Orders ───────────────────────────────────────────────────────
    def _seed_orders(self):
        from orders.models import Order
        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        style_ids = list(Style.objects.values_list("id", flat=True))

        for i in range(1, 26):
            Order.objects.create(
                organization_id=ORG_ID,
                buyer_id=random.choice(buyer_ids),
                style_id=random.choice(style_ids),
                order_number=f"ORD{i:04d}",
                order_date=self._past_date(180),
                delivery_date=self._future_date(10) if random.random() > 0.3 else self._future_date(30),
                quantity=random.randint(1000, 50000),
                unit_price=self._dec(5, 50),
                total_value=self._dec(10000, 1000000),
                status=random.choice(["draft", "confirmed", "in_production", "shipped", "delivered", "cancelled"]),
            )

    # ── Compliance ───────────────────────────────────────────────────
    def _seed_compliance(self):
        from compliance.models import ComplianceRecord
        from buyers.models import Buyer

        buyer_ids = list(Buyer.objects.values_list("id", flat=True))
        types = ["social", "environmental", "quality", "safety", "ethical"]
        for i in range(20):
            ComplianceRecord.objects.create(
                organization_id=ORG_ID,
                buyer_id=random.choice(buyer_ids),
                compliance_type=random.choice(types),
                title=fake.catch_phrase()[:50],
                description=fake.text(max_nb_chars=200),
                audit_date=self._past_date(300),
                audit_by=fake.name(),
                score=self._dec(60, 100, 1),
                status=random.choice(["planned", "in_progress", "passed", "failed", "corrective_action"]),
            )

    # ── Reporting ────────────────────────────────────────────────────
    def _seed_reporting(self):
        from reporting.models import Dashboard, Report

        for i in range(1, 11):
            Report.objects.create(
                organization_id=ORG_ID,
                title=fake.catch_phrase()[:50],
                report_type=random.choice(["production", "quality", "financial", "inventory", "hr", "custom"]),
                generated_by=fake.name(),
            )

        for i in range(1, 7):
            Dashboard.objects.create(
                organization_id=ORG_ID,
                name=fake.catch_phrase()[:50],
                dashboard_type=random.choice(["production", "quality", "financial", "management"]),
                created_by=fake.name(),
                is_default=random.random() < 0.2,
            )

    # ── Performance ──────────────────────────────────────────────────
    def _seed_performance(self):
        from performance.models import PerformanceRecord
        from production.models import ProductionLine
        from merchandising.models import Style

        style_ids = list(Style.objects.values_list("id", flat=True))
        line_ids = list(ProductionLine.objects.values_list("id", flat=True))
        metrics = ["efficiency", "output", "defect_rate", "downtime"]
        for i in range(30):
            PerformanceRecord.objects.create(
                organization_id=ORG_ID,
                style_id=random.choice(style_ids),
                production_line_id=random.choice(line_ids),
                record_date=self._past_date(90),
                metric=random.choice(metrics),
                value=self._dec(50, 100, 1),
                target=self._dec(70, 95, 1),
                unit=random.choice(["%", "pcs", "hours"]),
            )

    # ── Planning ─────────────────────────────────────────────────────
    def _seed_planning(self):
        from planning.models import Plan
        from merchandising.models import Style, PurchaseOrder
        style_ids = list(Style.objects.values_list("id", flat=True))
        po_ids = list(PurchaseOrder.objects.values_list("id", flat=True))
        for i in range(1, 13):
            Plan.objects.create(
                organization_id=ORG_ID,
                style_id=random.choice(style_ids),
                purchase_order_id=random.choice(po_ids) if random.random() > 0.3 else None,
                plan_type=random.choice(["production", "capacity", "material", "shipment"]),
                title=f"Plan {i}: {fake.catch_phrase()[:40]}",
                start_date=self._past_date(120),
                end_date=self._future_date(30),
                details=fake.text(max_nb_chars=150),
                status=random.choice(["draft", "approved", "in_progress", "completed"]),
                created_by=fake.name(),
            )

    # ── Scheduling ──────────────────────────────────────────────────
    def _seed_scheduling(self):
        from scheduling.models import Schedule
        from production.models import ProductionLine, ProductionOrder

        line_ids = list(ProductionLine.objects.values_list("id", flat=True))
        prod_ids = list(ProductionOrder.objects.values_list("id", flat=True))
        for i in range(1, 16):
            sched_date = self._past_date(90)
            Schedule.objects.create(
                organization_id=ORG_ID,
                production_order_id=random.choice(prod_ids) if prod_ids else None,
                production_line_id=random.choice(line_ids) if line_ids else None,
                scheduled_date=sched_date,
                start_time=datetime.strptime(f"{random.randint(7, 9):02d}:00", "%H:%M").time(),
                end_time=datetime.strptime(f"{random.randint(16, 20):02d}:00", "%H:%M").time(),
                target_quantity=random.randint(5000, 30000),
                status=random.choice(["draft", "published", "in_progress", "completed"]),
                notes=fake.text(max_nb_chars=80),
            )

    # ── Costing ──────────────────────────────────────────────────────
    def _seed_costing(self):
        from merchandising.models import Style
        style_ids = list(Style.objects.values_list("id", flat=True))
        for sid in style_ids[:15]:
            fc = self._dec(2, 8)
            ac = self._dec(0.5, 2)
            tc = self._dec(0.1, 0.5)
            lc = self._dec(0.5, 2)
            oc = self._dec(0.2, 1)
            cc = self._dec(0.1, 0.5)
            total = fc + ac + tc + lc + oc + cc
            sp = total * self._dec(1.1, 1.3)
            PreCosting.objects.create(
                organization_id=ORG_ID,
                buyer_id=random.choice(list(Buyer.objects.values_list("id", flat=True))),
                style_id=sid,
                cost_date=self._past_date(200),
                estimated_fabric_cost=fc,
                estimated_accessory_cost=ac,
                estimated_trim_cost=tc,
                estimated_labor_cost=lc,
                estimated_overhead=oc,
                total_estimated_cost=total,
                target_price=sp,
                expected_margin=self._dec(10, 25),
                status=random.choice(["draft", "approved", "revised"]),
            )
            CostSheet.objects.create(
                organization_id=ORG_ID,
                style_id=sid,
                cost_date=self._past_date(100),
                fabric_cost=fc,
                accessory_cost=ac,
                trim_cost=tc,
                labor_cost=lc,
                overhead_cost=oc,
                commercial_cost=cc,
                total_cost=total,
                selling_price=sp,
                margin=self._dec(10, 25),
                status=random.choice(["draft", "approved"]),
            )

    # ── Multi-Company ────────────────────────────────────────────────
    def _seed_multi_company(self):
        from core.models import Currency
        currency_ids = list(Currency.objects.values_list("id", flat=True))
        companies = [
            ("Texon Garments Ltd.", "TGL", "BD"),
            ("Texon Exports Ltd.", "TEL", "BD"),
            ("Texon International FZE", "TIF", "AE"),
            ("Texon Europe GmbH", "TEG", "DE"),
        ]
        for i, (name, code, country) in enumerate(companies):
            gc = GroupCompany.objects.create(
                organization_id=ORG_ID,
                name=name, code=code,
                registration_number=f"REG{2020 + i}{i:03d}",
                country=country,
            )
            mc = MultiCompany.objects.create(
                parent_company=gc, name=name, code=code, country=country,
            )
            LocationBasedOperation.objects.create(
                multi_company=mc,
                location_id=random.choice([1, 2, 3]),
                operation_type=random.choice(["manufacturing", "sourcing", "trading", "logistics"]),
            )

    # ── OTP ─────────────────────────────────────────────────────────
    def _seed_otps(self):
        from authentication.models import OTP, User
        if OTP.objects.exists():
            return
        user_ids = list(User.objects.values_list("id", flat=True))
        if not user_ids:
            return
        for user_id in user_ids:
            for purpose in ["password_reset", "email_verify"]:
                used = random.random() > 0.5
                OTP.objects.create(
                    user_id=user_id,
                    code=str(random.randint(100000, 999999)),
                    purpose=purpose,
                    is_used=used,
                    expires_at=timezone.now() + timedelta(minutes=10),
                )

    # ── AI ──────────────────────────────────────────────────────────
    def _seed_ai(self):
        from ai.models import ConversationLog, MessageLog
        from authentication.models import User
        if ConversationLog.objects.exists():
            return
        user_ids = list(User.objects.values_list("id", flat=True))
        if not user_ids:
            return
        prompts = [
            "What is the current production status?",
            "Show me pending shipments",
            "Summarize today's attendance",
            "Which orders are delayed?",
            "What is the open LC exposure?",
        ]
        for i in range(1, 11):
            conv = ConversationLog.objects.create(
                conversation_id=f"conv-{2025}-{i:04d}",
                user_id=random.choice(user_ids),
            )
            for role, content in [
                ("user", random.choice(prompts)),
                ("assistant", fake.text(max_nb_chars=200)),
                ("user", random.choice(prompts)),
                ("assistant", fake.text(max_nb_chars=180)),
            ]:
                MessageLog.objects.create(
                    conversation=conv,
                    role=role,
                    content=content,
                    tool_name=random.choice(["", "query_shipments", "query_orders", "query_attendance"]),
                )


# Fix missing imports used in this file
from datetime import datetime
