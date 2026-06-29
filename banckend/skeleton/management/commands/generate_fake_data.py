from datetime import time, timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.db.models.signals import post_save
from django.db import transaction
from django.utils import timezone
from faker import Faker

from ai_insights.models import (
    CommandHistory,
    Insight,
    MLModel,
    Prediction,
    QueryTemplate,
    Recommendation,
)
from compliance.models import (
    Audit,
    AuditFinding,
    CertifyingAuthority,
    ComplianceCertificate,
    ComplianceScore,
    ESGMetric,
)
from costing.models import (
    ApprovalWorkflow,
    BillOfMaterials,
    BOMCategory,
    BOMItem,
    CostRevision,
    SupplierQuote,
)
from hr.models import (
    Attendance,
    Department,
    Designation,
    Employee,
    EmployeeGrade,
    LeaveRequest,
    PayrollEntry,
    PayrollRun,
    ShiftRotation,
    ShiftSchedule,
)
from inventory.models import (
    DeadstockAlert,
    FabricRoll,
    InventoryItem,
    ReorderPrediction,
    Requisition,
    StockLevel,
    StockTransaction,
    Warehouse,
    WarehouseZone,
)
from notifications.models import (
    AlertRule,
    EmailTemplate,
    Notification,
    NotificationPreference,
    SMSTemplate,
)
from notifications.signals import send_notification_to_websocket
from orders.models import (
    Buyer,
    BuyerRating,
    OrderItem,
    OrderStageLog,
    PurchaseOrder,
    SampleDevelopment,
    Season,
    Style,
)
from production.models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    HeatmapData,
    LineCapacity,
    OEELog,
    ProductionLine,
    ProductionRecord,
    ProductionShift,
    ProductionUnit,
)
from reports.models import ExportJob, ReportRun, ReportTemplate, ScheduledReport
from users.models import CustomUser, Organization


class Command(BaseCommand):
    help = "Generates Faker-powered dummy data for local development and demos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--employees",
            type=int,
            default=30,
            help="Number of employees to create. Default: 30",
        )
        parser.add_argument(
            "--history-days",
            type=int,
            default=14,
            help="Number of recent days to seed operational history for. Default: 14",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=20260629,
            help="Random seed used by Faker and Python random. Default: 20260629",
        )

    def handle(self, *args, **options):
        self.fake = Faker()
        Faker.seed(options["seed"])
        random.seed(options["seed"])
        self.created_counts = {}
        self.today = timezone.localdate()

        with transaction.atomic():
            org = self.create_organization()
            users = self.create_users(org)
            production_context = self.create_production_data(
                org,
                history_days=options["history_days"],
            )
            employees = self.create_hr_data(
                org,
                users=users,
                shifts=production_context["shifts"],
                employee_count=options["employees"],
                history_days=options["history_days"],
            )
            order_context = self.create_order_data(org, users)
            inventory_context = self.create_inventory_data(org, users)
            self.create_costing_data(org, users, order_context["purchase_orders"])
            self.create_compliance_data(org)
            self.create_report_data(org, users)
            self.create_notification_data(org, users)
            self.create_ai_data(
                org,
                users=users,
                lines=production_context["lines"],
                items=inventory_context["items"],
                purchase_orders=order_context["purchase_orders"],
            )

        self.stdout.write(self.style.SUCCESS("Successfully generated dummy data with Faker."))
        self.stdout.write("Login email: admin@texon.local")
        self.stdout.write("Password: password123!")
        self.stdout.write("")
        self.stdout.write("Created this run:")
        for model_name in sorted(self.created_counts):
            self.stdout.write(f"  {model_name}: {self.created_counts[model_name]}")

        if not self.created_counts:
            self.stdout.write("  No new records; demo data already exists.")

    def create_organization(self):
        org, _ = self.first_or_create(
            Organization,
            code="TEXON",
            defaults={"name": "Texon Apparel Ltd."},
        )
        return org

    def create_users(self, org):
        users = []
        admin_email = "admin@texon.local"
        admin = CustomUser.objects.filter(email=admin_email).first()

        if admin is None:
            admin = CustomUser.objects.create_superuser(
                email=admin_email,
                password="password123!",
                organization=org,
                first_name="Demo",
                last_name="Admin",
            )
            self.bump("CustomUser")
        elif admin.organization_id != org.id:
            admin.organization = org
            admin.save(update_fields=["organization"])

        users.append(admin)

        demo_users = [
            ("production.manager@texon.local", "Production", "Manager"),
            ("merchandiser@texon.local", "Lead", "Merchandiser"),
            ("inventory@texon.local", "Inventory", "Controller"),
            ("hr@texon.local", "Human", "Resources"),
            ("compliance@texon.local", "Compliance", "Officer"),
        ]

        for email, first_name, last_name in demo_users:
            user = CustomUser.objects.filter(email=email).first()
            if user is None:
                user = CustomUser.objects.create_user(
                    email=email,
                    password="password123!",
                    organization=org,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,
                )
                self.bump("CustomUser")
            elif user.organization_id != org.id:
                user.organization = org
                user.save(update_fields=["organization"])
            users.append(user)

        return users

    def create_production_data(self, org, history_days):
        unit_specs = [
            ("Unit A - Wovens", "Dhaka Floor 1"),
            ("Unit B - Knits", "Dhaka Floor 2"),
            ("Unit C - Denim", "Gazipur Annex"),
        ]
        units = []
        lines = []

        for unit_name, location in unit_specs:
            unit, _ = self.first_or_create(
                ProductionUnit,
                organization=org,
                name=unit_name,
                defaults={"location": location},
            )
            units.append(unit)

            for line_index in range(1, 5):
                line_name = f"Sewing Line {unit_name.split()[1]}{line_index}"
                line, _ = self.first_or_create(
                    ProductionLine,
                    production_unit=unit,
                    name=line_name,
                    defaults={"is_active": True},
                )
                lines.append(line)
                self.first_or_create(
                    LineCapacity,
                    production_line=line,
                    defaults={"daily_capacity_pcs": random.randint(1800, 5200)},
                )

        shifts = []
        shift_specs = [
            ("Morning Shift", time(6, 0), time(14, 0)),
            ("Evening Shift", time(14, 0), time(22, 0)),
            ("Night Shift", time(22, 0), time(6, 0)),
        ]
        for name, start_time, end_time in shift_specs:
            shift, _ = self.first_or_create(
                ProductionShift,
                organization=org,
                name=name,
                defaults={"start_time": start_time, "end_time": end_time},
            )
            shifts.append(shift)

        downtime_reasons = [
            "Needle breakage",
            "Thread tension issue",
            "Machine maintenance",
            "Material shortage",
            "Quality hold",
        ]
        defect_types = ["Broken stitch", "Skip stitch", "Oil stain", "Misalignment"]

        for day_offset in range(history_days):
            record_date = self.today - timedelta(days=day_offset)
            for line in lines:
                for shift in shifts:
                    timestamp = timezone.make_aware(
                        timezone.datetime.combine(record_date, shift.start_time)
                    )
                    output_pcs = random.randint(850, 4600)
                    self.first_or_create(
                        ProductionRecord,
                        production_line=line,
                        shift=shift,
                        timestamp=timestamp,
                        defaults={"output_pcs": output_pcs},
                    )

                timestamp = timezone.make_aware(
                    timezone.datetime.combine(record_date, time(12, 0))
                )
                availability = self.decimal_between(78, 98)
                performance = self.decimal_between(74, 96)
                quality = self.decimal_between(88, 99)
                oee_score = ((availability * performance * quality) / Decimal("10000")).quantize(
                    Decimal("0.01")
                )
                self.first_or_create(
                    OEELog,
                    production_line=line,
                    timestamp=timestamp,
                    defaults={
                        "availability_rate": availability,
                        "performance_rate": performance,
                        "quality_rate": quality,
                        "oee_score": oee_score,
                    },
                )
                self.first_or_create(
                    DefectLog,
                    production_line=line,
                    timestamp=timestamp,
                    defect_type=random.choice(defect_types),
                    defaults={
                        "quantity": random.randint(2, 45),
                        "checked_units": random.randint(500, 1800),
                    },
                )
                self.first_or_create(
                    HeatmapData,
                    production_line=line,
                    timestamp=timestamp,
                    defaults={"activity_score": random.randint(45, 100)},
                )

            if day_offset % 3 == 0:
                line = random.choice(lines)
                started_at = timezone.make_aware(
                    timezone.datetime.combine(record_date, time(random.randint(8, 17), 0))
                )
                duration = random.randint(15, 140)
                is_resolved = random.choice([True, True, False])
                self.first_or_create(
                    DowntimeEvent,
                    production_line=line,
                    started_at=started_at,
                    defaults={
                        "reason": random.choice(downtime_reasons),
                        "duration_minutes": duration,
                        "resolved_at": started_at + timedelta(minutes=duration)
                        if is_resolved
                        else None,
                    },
                )

        for line in random.sample(lines, k=min(5, len(lines))):
            self.first_or_create(
                BottleneckAlert,
                production_line=line,
                alert_message=f"{line.name} is trending below planned output.",
                defaults={"is_resolved": random.choice([False, False, True])},
            )

        return {"units": units, "lines": lines, "shifts": shifts}

    def create_hr_data(self, org, users, shifts, employee_count, history_days):
        grades = []
        for name, salary in [
            ("A", Decimal("65000.00")),
            ("B", Decimal("48000.00")),
            ("C", Decimal("32000.00")),
            ("D", Decimal("22000.00")),
        ]:
            grade, _ = self.first_or_create(
                EmployeeGrade,
                organization=org,
                name=name,
                defaults={"basic_salary": salary},
            )
            grades.append(grade)

        departments = []
        for department_name in ["Production", "Quality", "Finishing", "Inventory", "HR"]:
            department, _ = self.first_or_create(
                Department,
                organization=org,
                name=department_name,
            )
            departments.append(department)

        designations = []
        for designation_name in [
            "Sewing Operator",
            "Line Supervisor",
            "Quality Inspector",
            "Store Keeper",
            "Finishing Assistant",
        ]:
            designation, _ = self.first_or_create(
                Designation,
                organization=org,
                name=designation_name,
            )
            designations.append(designation)

        employees = []
        for employee_index in range(1, employee_count + 1):
            employee, _ = self.first_or_create(
                Employee,
                employee_id=f"EMP{1000 + employee_index}",
                defaults={
                    "organization": org,
                    "first_name": self.fake.first_name(),
                    "last_name": self.fake.last_name(),
                    "grade": random.choice(grades),
                    "department": random.choice(departments),
                    "designation": random.choice(designations),
                    "date_joined": self.fake.date_between(
                        start_date=self.today - timedelta(days=365 * 5),
                        end_date=self.today - timedelta(days=30),
                    ),
                    "is_active": True,
                },
            )
            employees.append(employee)

        for day_offset in range(history_days):
            attendance_date = self.today - timedelta(days=day_offset)
            for employee in employees:
                status = random.choices(
                    ["present", "late", "absent", "leave"],
                    weights=[76, 12, 7, 5],
                    k=1,
                )[0]
                check_in = None
                check_out = None
                if status == "present":
                    check_in = time(8, random.randint(0, 10))
                    check_out = time(17, random.randint(0, 30))
                elif status == "late":
                    check_in = time(9, random.randint(1, 45))
                    check_out = time(18, random.randint(0, 30))

                self.first_or_create(
                    Attendance,
                    employee=employee,
                    date=attendance_date,
                    defaults={
                        "status": status,
                        "check_in": check_in,
                        "check_out": check_out,
                    },
                )

        for employee in employees[:8]:
            start_date = self.today + timedelta(days=random.randint(3, 35))
            end_date = start_date + timedelta(days=random.randint(1, 4))
            self.first_or_create(
                LeaveRequest,
                employee=employee,
                start_date=start_date,
                end_date=end_date,
                defaults={
                    "leave_type": random.choice(["casual", "sick", "earned"]),
                    "reason": self.fake.sentence(nb_words=8),
                    "status": random.choice(["pending", "approved", "rejected"]),
                    "reviewed_by": random.choice(users),
                },
            )

        payroll, _ = self.first_or_create(
            PayrollRun,
            organization=org,
            month=self.today.month,
            year=self.today.year,
            defaults={"status": "verified"},
        )
        for employee in employees:
            basic_salary = employee.grade.basic_salary if employee.grade else Decimal("22000.00")
            allowances = self.decimal_between(1000, 5000)
            deductions = self.decimal_between(0, 1800)
            self.first_or_create(
                PayrollEntry,
                payroll_run=payroll,
                employee=employee,
                defaults={
                    "basic_salary": basic_salary,
                    "allowances": allowances,
                    "deductions": deductions,
                    "net_salary": basic_salary + allowances - deductions,
                },
            )

        for name, rules in [
            ("General Rotation", "Morning shift for five days, weekly rest on Friday."),
            ("Two Shift Rotation", "Morning and evening shifts rotate weekly."),
            ("Night Support", "Night shift support with two weekly rest days."),
        ]:
            self.first_or_create(
                ShiftRotation,
                organization=org,
                name=name,
                defaults={"rotation_rules": rules},
            )

        week_number = f"{self.today.isocalendar().year}-W{self.today.isocalendar().week:02d}"
        for employee in employees:
            self.first_or_create(
                ShiftSchedule,
                employee=employee,
                week_number=week_number,
                defaults={"shift": random.choice(shifts)},
            )

        return employees

    def create_order_data(self, org, users):
        buyers = []
        buyer_specs = [
            ("Horizon Retail", "BUY001", "United States"),
            ("Northlake Outfitters", "BUY002", "Canada"),
            ("Moda Verde", "BUY003", "Italy"),
            ("Aster Apparel", "BUY004", "United Kingdom"),
            ("Kyoto Basics", "BUY005", "Japan"),
        ]
        for name, code, country in buyer_specs:
            buyer, _ = self.first_or_create(
                Buyer,
                code=code,
                defaults={"organization": org, "name": name, "country": country},
            )
            buyers.append(buyer)
            self.first_or_create(
                BuyerRating,
                buyer=buyer,
                defaults={
                    "rating": self.decimal_between(3.6, 4.95),
                    "reviews_count": random.randint(12, 140),
                },
            )

        seasons = []
        for season_name in ["SS26", "AW26", "Resort26"]:
            season, _ = self.first_or_create(
                Season,
                organization=org,
                name=season_name,
                year=2026,
            )
            seasons.append(season)

        garment_types = ["T-shirt", "Hoodie", "Chino", "Denim jacket", "Polo shirt"]
        styles = []
        for style_index in range(1, 13):
            style_code = f"STY-2026-{style_index:03d}"
            style, _ = self.first_or_create(
                Style,
                code=style_code,
                defaults={
                    "organization": org,
                    "buyer": random.choice(buyers),
                    "season": random.choice(seasons),
                    "description": f"{self.fake.color_name()} {random.choice(garment_types)}",
                },
            )
            styles.append(style)

        stage_values = [stage for stage, _label in PurchaseOrder.STAGE_CHOICES]
        purchase_orders = []
        colors = ["Black", "Navy", "White", "Olive", "Stone", "Sky Blue"]
        sizes = ["XS", "S", "M", "L", "XL"]

        for po_index in range(1, 21):
            po_number = f"PO-2026-{po_index:04d}"
            current_stage = random.choice(stage_values)
            po, _ = self.first_or_create(
                PurchaseOrder,
                po_number=po_number,
                defaults={
                    "organization": org,
                    "style": random.choice(styles),
                    "qty": random.randint(3000, 45000),
                    "ship_date": self.today + timedelta(days=random.randint(30, 180)),
                    "current_stage": current_stage,
                },
            )
            purchase_orders.append(po)

            item_count = random.randint(3, 6)
            for color in random.sample(colors, k=item_count):
                for size in random.sample(sizes, k=random.randint(2, 4)):
                    self.first_or_create(
                        OrderItem,
                        purchase_order=po,
                        color=color,
                        size=size,
                        defaults={"qty": random.randint(250, 3500)},
                    )

            current_stage_index = stage_values.index(po.current_stage)
            for stage in stage_values[: current_stage_index + 1]:
                self.first_or_create(
                    OrderStageLog,
                    purchase_order=po,
                    stage=stage,
                    defaults={
                        "changed_by": random.choice(users),
                        "notes": f"{stage.replace('_', ' ').title()} completed for demo flow.",
                    },
                )

        for style in styles[:10]:
            for sample_type in ["proto", "size_set", "top"]:
                self.first_or_create(
                    SampleDevelopment,
                    style=style,
                    sample_type=sample_type,
                    defaults={
                        "status": random.choice(["pending", "submitted", "approved", "rejected"]),
                        "submission_date": self.today - timedelta(days=random.randint(1, 45)),
                        "comments": self.fake.sentence(nb_words=10),
                    },
                )

        return {"buyers": buyers, "seasons": seasons, "styles": styles, "purchase_orders": purchase_orders}

    def create_inventory_data(self, org, users):
        warehouse_specs = [
            ("Main Fabric Warehouse", "Dhaka Industrial Area"),
            ("Trims and Packaging Store", "Gazipur Annex"),
        ]
        warehouses = []
        zones = []
        for warehouse_name, location in warehouse_specs:
            warehouse, _ = self.first_or_create(
                Warehouse,
                organization=org,
                name=warehouse_name,
                defaults={"location": location},
            )
            warehouses.append(warehouse)
            for zone_code in ["A1", "A2", "B1", "B2"]:
                zone, _ = self.first_or_create(
                    WarehouseZone,
                    warehouse=warehouse,
                    code=zone_code,
                )
                zones.append(zone)

        item_specs = [
            ("FAB-001", "Cotton Jersey 180gsm", "yards"),
            ("FAB-002", "Denim Twill 12oz", "yards"),
            ("FAB-003", "French Terry Fleece", "yards"),
            ("FAB-004", "Poplin Shirting Fabric", "yards"),
            ("TRM-001", "Polyester Sewing Thread", "cones"),
            ("TRM-002", "Metal Zipper 6 inch", "pcs"),
            ("TRM-003", "Four Hole Button", "pcs"),
            ("TRM-004", "Elastic Tape 1 inch", "meters"),
            ("PKG-001", "Printed Carton", "pcs"),
            ("PKG-002", "Poly Bag Medium", "pcs"),
            ("PKG-003", "Hang Tag", "pcs"),
            ("PKG-004", "Care Label", "pcs"),
        ]
        items = []
        for sku, name, unit in item_specs:
            item, _ = self.first_or_create(
                InventoryItem,
                sku=sku,
                defaults={
                    "organization": org,
                    "name": name,
                    "description": self.fake.sentence(nb_words=8),
                    "unit_of_measure": unit,
                },
            )
            items.append(item)

        for item_index, item in enumerate(items, start=1):
            zone = zones[item_index % len(zones)]
            stock_qty = self.decimal_between(750, 12000)
            self.first_or_create(
                StockLevel,
                warehouse_zone=zone,
                inventory_item=item,
                defaults={"current_stock": stock_qty},
            )
            self.first_or_create(
                StockTransaction,
                organization=org,
                inventory_item=item,
                transaction_type="receive",
                to_zone=zone,
                quantity=stock_qty,
                defaults={"performed_by": random.choice(users)},
            )

            if item.sku.startswith("FAB"):
                for roll_index in range(1, 5):
                    roll_length = self.decimal_between(80, 320)
                    self.first_or_create(
                        FabricRoll,
                        batch_no=f"BCH-{item_index:03d}-{roll_index:02d}",
                        defaults={
                            "organization": org,
                            "inventory_item": item,
                            "length_yards": roll_length,
                            "warehouse_zone": zone,
                        },
                    )

        for item in random.sample(items, k=8):
            self.first_or_create(
                Requisition,
                organization=org,
                inventory_item=item,
                quantity_requested=self.decimal_between(50, 800),
                defaults={
                    "requested_by": random.choice(users),
                    "status": random.choice(["pending", "approved", "issued", "rejected"]),
                },
            )

        for item in items[:5]:
            risk = self.decimal_between(40, 88)
            self.first_or_create(
                DeadstockAlert,
                organization=org,
                inventory_item=item,
                defaults={
                    "risk_percentage": risk,
                    "alert_message": f"{item.name} has {risk}% projected deadstock risk.",
                },
            )

        for item in items:
            self.first_or_create(
                ReorderPrediction,
                organization=org,
                inventory_item=item,
                defaults={
                    "recommended_qty": self.decimal_between(500, 5000),
                    "prediction_confidence": self.decimal_between(68, 96),
                },
            )

        return {"warehouses": warehouses, "zones": zones, "items": items}

    def create_costing_data(self, org, users, purchase_orders):
        categories = []
        for name, description in [
            ("Fabric", "Primary shell and lining fabrics"),
            ("Trims", "Buttons, zippers, thread, labels"),
            ("Packaging", "Cartons, bags, hang tags"),
            ("Labor", "Cutting, sewing, finishing labor"),
            ("Overhead", "Utilities and administrative overhead"),
        ]:
            category, _ = self.first_or_create(
                BOMCategory,
                organization=org,
                name=name,
                defaults={"description": description},
            )
            categories.append(category)

        for quote_index in range(1, 11):
            self.first_or_create(
                SupplierQuote,
                organization=org,
                supplier_name=f"{self.fake.company()} Supplies",
                item_description=f"Demo quote item {quote_index}",
                defaults={
                    "unit_price": self.decimal_between(0.02, 8.5, places=4),
                    "currency": "USD",
                    "valid_until": self.today + timedelta(days=random.randint(20, 120)),
                },
            )

        for po in purchase_orders[:10]:
            bom, _ = self.first_or_create(
                BillOfMaterials,
                organization=org,
                purchase_order=po,
                version=1,
                defaults={
                    "style_code": po.style.code,
                    "is_approved": random.choice([True, True, False]),
                },
            )
            for category in categories:
                self.first_or_create(
                    BOMItem,
                    bill_of_materials=bom,
                    category=category,
                    description=f"{category.name} allowance for {po.style.code}",
                    defaults={
                        "required_qty": self.decimal_between(1, 16, places=4),
                        "unit_price": self.decimal_between(0.04, 7.5, places=4),
                        "wastage_percentage": self.decimal_between(1, 12),
                    },
                )

            self.first_or_create(
                CostRevision,
                bill_of_materials=bom,
                reason="Initial demo costing uploaded from Faker seed data.",
                defaults={"revised_by": random.choice(users)},
            )
            self.first_or_create(
                ApprovalWorkflow,
                bill_of_materials=bom,
                approver=random.choice(users),
                defaults={
                    "status": random.choice(["pending", "approved", "rejected"]),
                    "comments": self.fake.sentence(nb_words=9),
                    "actioned_at": timezone.now() if random.choice([True, False]) else None,
                },
            )

    def create_compliance_data(self, org):
        authorities = []
        for authority_name in [
            "Bangladesh Fire Service",
            "BSCI Certification Body",
            "OEKO-TEX Association",
            "Department of Environment",
        ]:
            authority, _ = self.first_or_create(
                CertifyingAuthority,
                organization=org,
                name=authority_name,
                defaults={"description": self.fake.sentence(nb_words=10)},
            )
            authorities.append(authority)

        certificate_names = ["Fire License", "BSCI Audit Certificate", "OEKO-TEX Standard 100"]
        for index, certificate_name in enumerate(certificate_names, start=1):
            issue_date = self.today - timedelta(days=random.randint(60, 400))
            self.first_or_create(
                ComplianceCertificate,
                organization=org,
                name=certificate_name,
                defaults={
                    "authority": authorities[index % len(authorities)],
                    "issue_date": issue_date,
                    "expiry_date": issue_date + timedelta(days=365),
                    "document": f"compliance_documents/demo-{index}.pdf",
                    "is_valid": True,
                },
            )

        for month_offset in range(6):
            recorded_date = self.today.replace(day=1) - timedelta(days=month_offset * 30)
            self.first_or_create(
                ESGMetric,
                organization=org,
                recorded_date=recorded_date,
                defaults={
                    "carbon_footprint_tonnes": self.decimal_between(85, 220),
                    "water_recycled_liters": self.decimal_between(15000, 85000),
                    "renewable_energy_kwh": self.decimal_between(5000, 32000),
                },
            )

        for audit_index in range(1, 5):
            audit_date = self.today - timedelta(days=random.randint(15, 220))
            audit, _ = self.first_or_create(
                Audit,
                organization=org,
                audit_name=f"Demo Compliance Audit {audit_index}",
                audit_date=audit_date,
                defaults={
                    "auditor": self.fake.company(),
                    "score": self.decimal_between(72, 98),
                    "report_file": f"audit_reports/demo-audit-{audit_index}.pdf",
                },
            )
            for finding_index in range(1, 4):
                self.first_or_create(
                    AuditFinding,
                    audit=audit,
                    finding_description=f"Demo finding {finding_index} for {audit.audit_name}",
                    defaults={
                        "severity": random.choice(["low", "medium", "high", "critical"]),
                        "remediation_plan": self.fake.sentence(nb_words=12),
                        "is_resolved": random.choice([True, False]),
                    },
                )

        self.first_or_create(
            ComplianceScore,
            organization=org,
            defaults={
                "social_score": self.decimal_between(78, 98),
                "environmental_score": self.decimal_between(70, 94),
                "safety_score": self.decimal_between(82, 99),
            },
        )

    def create_report_data(self, org, users):
        template_specs = [
            ("Daily Production Summary", {"module": "production", "charts": ["oee", "output"]}),
            ("Inventory Risk Report", {"module": "inventory", "charts": ["deadstock", "reorder"]}),
            ("Payroll Verification", {"module": "hr", "charts": ["payroll", "attendance"]}),
            ("Compliance Dashboard", {"module": "compliance", "charts": ["score", "audit"]}),
        ]
        templates = []
        for name, config_data in template_specs:
            template, _ = self.first_or_create(
                ReportTemplate,
                organization=org,
                name=name,
                defaults={"config_data": config_data},
            )
            templates.append(template)

        for template in templates:
            self.first_or_create(
                ReportRun,
                organization=org,
                template=template,
                defaults={
                    "run_by": random.choice(users),
                    "generated_file": f"generated_reports/{template.name.lower().replace(' ', '-')}.pdf",
                },
            )
            self.first_or_create(
                ScheduledReport,
                organization=org,
                template=template,
                defaults={
                    "frequency": random.choice(["daily", "weekly", "monthly"]),
                    "email_recipients": "admin@texon.local,production.manager@texon.local",
                    "is_active": True,
                },
            )

        for job_type in ["PDF", "Excel", "CSV", "Dashboard Snapshot"]:
            self.first_or_create(
                ExportJob,
                organization=org,
                job_type=job_type,
                defaults={
                    "status": random.choice(["pending", "running", "completed", "failed"]),
                    "result_file": f"exports/demo-{job_type.lower().replace(' ', '-')}.xlsx",
                },
            )

    def create_notification_data(self, org, users):
        post_save.disconnect(send_notification_to_websocket, sender=Notification)
        try:
            for user in users:
                self.first_or_create(
                    NotificationPreference,
                    user=user,
                    defaults={
                        "email_enabled": True,
                        "sms_enabled": random.choice([True, False]),
                        "in_app_enabled": True,
                    },
                )

                for title in [
                    "Production target update",
                    "Inventory reorder needed",
                    "Compliance task due",
                    "Payroll run ready",
                ]:
                    self.first_or_create(
                        Notification,
                        user=user,
                        title=title,
                        defaults={
                            "message": self.fake.sentence(nb_words=12),
                            "is_read": random.choice([True, False]),
                        },
                    )
        finally:
            post_save.connect(send_notification_to_websocket, sender=Notification)

        self.first_or_create(
            EmailTemplate,
            organization=org,
            name="Daily Production Alert",
            defaults={
                "subject": "Daily production status",
                "body_html": "<p>Your daily production summary is ready.</p>",
            },
        )
        self.first_or_create(
            SMSTemplate,
            organization=org,
            name="Critical Inventory Alert",
            defaults={"message_text": "Critical inventory alert: review reorder dashboard."},
        )

        for rule_name, metric, threshold in [
            ("Defect Rate Threshold", "defect_rate", Decimal("4.50")),
            ("Low OEE Threshold", "oee_score", Decimal("65.00")),
            ("Deadstock Risk Threshold", "deadstock_risk", Decimal("70.00")),
        ]:
            self.first_or_create(
                AlertRule,
                organization=org,
                rule_name=rule_name,
                defaults={
                    "metric_to_monitor": metric,
                    "threshold_value": threshold,
                    "comparison_operator": ">",
                    "is_active": True,
                },
            )

    def create_ai_data(self, org, users, lines, items, purchase_orders):
        models = []
        model_specs = [
            ("OEE Forecaster", "1.2.0", {"mae": 3.4, "r2": 0.82}),
            ("Inventory Risk Classifier", "2.1.1", {"accuracy": 0.91, "precision": 0.88}),
            ("Shipment Delay Predictor", "1.4.3", {"auc": 0.87, "recall": 0.84}),
        ]
        for name, version, metrics in model_specs:
            model, _ = self.first_or_create(
                MLModel,
                organization=org,
                name=name,
                version=version,
                defaults={"is_active": True, "performance_metrics": metrics},
            )
            models.append(model)

        prediction_targets = [line.name for line in lines[:4]]
        prediction_targets += [item.sku for item in items[:4]]
        prediction_targets += [po.po_number for po in purchase_orders[:4]]
        for target in prediction_targets:
            self.first_or_create(
                Prediction,
                organization=org,
                ml_model=random.choice(models),
                target_object_id=target,
                prediction_type=random.choice(["delay_risk", "efficiency", "stock_out"]),
                defaults={
                    "prediction_value": self.decimal_between(12, 88),
                    "confidence_score": self.decimal_between(66, 97),
                },
            )

        insights = []
        insight_specs = [
            ("Line efficiency dip detected", "bottleneck"),
            ("Fast-moving trims need reorder", "stock_warning"),
            ("Shift plan can improve output", "optimization"),
            ("Compliance renewal window approaching", "compliance"),
        ]
        for title, insight_type in insight_specs:
            insight, _ = self.first_or_create(
                Insight,
                organization=org,
                title=title,
                defaults={
                    "description": self.fake.paragraph(nb_sentences=3),
                    "insight_type": insight_type,
                },
            )
            insights.append(insight)
            self.first_or_create(
                Recommendation,
                insight=insight,
                action_description=f"Review {insight_type.replace('_', ' ')} workflow and assign owner.",
                defaults={
                    "confidence_score": self.decimal_between(64, 95),
                    "is_executed": random.choice([False, False, True]),
                    "executed_by": random.choice(users),
                    "executed_at": timezone.now() if random.choice([True, False]) else None,
                },
            )

        for user in users[:3]:
            self.first_or_create(
                CommandHistory,
                user=user,
                command_text="Show me today's production risks",
                defaults={
                    "response_text": "Top risks include low OEE on two lines and one delayed material issue."
                },
            )

        for title, query, sql in [
            (
                "Production Output by Line",
                "Show production output by line for the last 7 days",
                "SELECT production_line_id, SUM(output_pcs) FROM production_productionrecord GROUP BY production_line_id",
            ),
            (
                "Open Inventory Requisitions",
                "List pending inventory requisitions",
                "SELECT * FROM inventory_requisition WHERE status = 'pending'",
            ),
            (
                "Upcoming Shipments",
                "Show purchase orders shipping in the next 30 days",
                "SELECT * FROM orders_purchaseorder WHERE ship_date <= date('now', '+30 days')",
            ),
        ]:
            self.first_or_create(
                QueryTemplate,
                title=title,
                defaults={"natural_language_query": query, "sql_template": sql},
            )

    def first_or_create(self, model, defaults=None, **lookup):
        obj = model.objects.filter(**lookup).first()
        if obj is not None:
            return obj, False

        payload = {**lookup, **(defaults or {})}
        obj = model.objects.create(**payload)
        self.bump(model.__name__)
        return obj, True

    def bump(self, model_name):
        self.created_counts[model_name] = self.created_counts.get(model_name, 0) + 1

    def decimal_between(self, min_value, max_value, places=2):
        scale = 10**places
        min_scaled = int(Decimal(str(min_value)) * scale)
        max_scaled = int(Decimal(str(max_value)) * scale)
        value = Decimal(random.randint(min_scaled, max_scaled)) / Decimal(scale)
        return value.quantize(Decimal("1").scaleb(-places))
