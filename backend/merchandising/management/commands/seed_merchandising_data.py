import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from core.models import Organization
from buyers.models import Buyer
from production.models import ProductionLine
from hr.models import Employee, Department, Designation
from merchandising.models import (
    Style,
    BuyerEnquiry,
    PurchaseOrder,
    SampleOrder,
    SMVRecord,
    DevelopmentMonitoring,
    BudgetDemandAssessment,
    IeSuggestion,
    SkillInventory,
    ProductionDowntime,
    ProcessWiseTarget,
)

fake = Faker()


class Command(BaseCommand):
    help = "Seeds merchandising modules with realistic sample data"

    def handle(self, *args, **options):
        org, _ = Organization.objects.get_or_create(
            name="Texon Garments Ltd.",
            defaults={
                "code": "TEXON",
                "address": fake.address(),
                "is_active": True,
            },
        )
        self.stdout.write(f"Organization: {org.name}")

        buyer_names = [
            ("H&M", "Sweeden"),
            ("Zara", "Spain"),
            ("Nike", "USA"),
            ("Adidas", "Germany"),
            ("Uniqlo", "Japan"),
            ("Levi's", "USA"),
            ("Gap", "USA"),
            ("Target", "USA"),
            ("M&S", "UK"),
            ("Decathlon", "France"),
        ]
        buyers = []
        for name, country in buyer_names:
            buyer, _ = Buyer.objects.get_or_create(
                organization=org,
                name=name,
                defaults={
                    "code": name[:3].upper(),
                    "country": country,
                    "is_active": True,
                },
            )
            buyers.append(buyer)
        self.stdout.write(f"{len(buyers)} buyers ready")

        lines = []
        line_names = [
            ("Line-A", "Bldg-1 Floor-1", 500),
            ("Line-B", "Bldg-1 Floor-1", 500),
            ("Line-C", "Bldg-1 Floor-2", 450),
            ("Line-D", "Bldg-1 Floor-2", 450),
            ("Line-E", "Bldg-2 Floor-1", 400),
            ("Line-F", "Bldg-2 Floor-1", 400),
            ("Line-G", "Bldg-2 Floor-2", 350),
            ("Line-H", "Bldg-3 Floor-1", 600),
            ("Line-I", "Bldg-3 Floor-1", 550),
            ("Line-J", "Bldg-3 Floor-2", 500),
        ]
        for name, loc, cap in line_names:
            line, _ = ProductionLine.objects.get_or_create(
                organization=org,
                code=name,
                defaults={
                    "name": f"Production {name}",
                    "location": loc,
                    "capacity": cap,
                    "is_active": True,
                },
            )
            lines.append(line)
        self.stdout.write(f"{len(lines)} production lines ready")

        departments = {}
        for dept_name in [
            "Cutting", "Sewing", "Finishing", "Packing", "IE",
            "Merchandising", "Quality", "Maintenance",
        ]:
            dept, _ = Department.objects.get_or_create(
                organization=org,
                name=dept_name,
                defaults={"code": dept_name[:3].upper(), "is_active": True},
            )
            departments[dept_name] = dept

        designations = {}
        dept_names_list = list(departments.keys())
        desig_defs = [
            ("Operator", dept_names_list),
            ("Senior Operator", dept_names_list),
            ("Supervisor", dept_names_list),
            ("IE Officer", ["IE"]),
            ("Merchandiser", ["Merchandising"]),
            ("Senior Merchandiser", ["Merchandising"]),
            ("Manager", dept_names_list),
            ("Executive", dept_names_list),
        ]
        for name_val, allowed_depts in desig_defs:
            dept = departments[random.choice(allowed_depts)]
            desig, _ = Designation.objects.get_or_create(
                organization=org,
                name=name_val,
                department=dept,
                defaults={
                    "code": name_val[:3].upper() + dept.name[:2].upper(),
                    "is_active": True,
                },
            )
            designations[name_val] = desig

        employees = []
        operator_names = [
            ("Md. Rahim", "Mia"),
            ("Fatima", "Begum"),
            ("Jamal", "Hossain"),
            ("Nasrin", "Akter"),
            ("Shahidul", "Islam"),
            ("Parvin", "Sultana"),
            ("Abdur", "Rahman"),
            ("Jahanara", "Khatun"),
            ("Mizanur", "Rahman"),
            ("Shamima", "Yasmin"),
            ("Khalid", "Hasan"),
            ("Rokeya", "Begum"),
            ("Shahjahan", "Mia"),
            ("Ayesha", "Khatun"),
            ("Mofijul", "Islam"),
            ("Shahnaj", "Parvin"),
            ("Badsha", "Mia"),
            ("Saleha", "Begum"),
            ("Riaz", "Uddin"),
            ("Shamim", "Hossain"),
        ]
        dept_names = list(departments.keys())
        desig_names = list(designations.keys())
        for i, (fn, ln) in enumerate(operator_names, 1):
            emp, _ = Employee.objects.get_or_create(
                organization=org,
                employee_id=f"EMP{org.id:03d}{i:04d}",
                defaults={
                    "first_name": fn.split()[0],
                    "last_name": ln,
                    "email": f"{fn.lower().replace(' ', '.')}.{ln.lower()}@texon.com",
                    "phone": fake.phone_number()[:50],
                    "date_of_joining": fake.date_between(start_date="-5y", end_date="-1m"),
                    "department": departments[random.choice(dept_names)],
                    "designation": designations[random.choice(desig_names)],
                    "employment_type": "permanent",
                    "status": "active",
                    "is_active": True,
                },
            )
            employees.append(emp)
        self.stdout.write(f"{len(employees)} employees ready")

        if not Style.objects.filter(organization=org).exists():
            style_data = [
                ("Classic Oxford Shirt", "STY-001", "Shirt"),
                ("Slim Fit Chinos", "STY-002", "Bottom"),
                ("Denim Jacket", "STY-003", "Jacket"),
                ("Polo T-Shirt", "STY-004", "T-Shirt"),
                ("Cargo Shorts", "STY-005", "Bottom"),
                ("Formal Blazer", "STY-006", "Jacket"),
                ("Cotton Sweater", "STY-007", "Knitwear"),
                ("Running Sneakers", "STY-008", "Footwear"),
                ("Leather Belt", "STY-009", "Accessory"),
                ("Evening Gown", "STY-010", "Dress"),
                ("Hooded Sweatshirt", "STY-011", "Knitwear"),
                ("Linen Trousers", "STY-012", "Bottom"),
                ("Silk Scarf", "STY-013", "Accessory"),
                ("Bomber Jacket", "STY-014", "Jacket"),
                ("Crop Top", "STY-015", "Top"),
            ]
            styles = []
            for name, sn, cat in style_data:
                s = Style.objects.create(
                    organization=org,
                    buyer=random.choice(buyers),
                    name=name,
                    style_number=sn,
                    description=f"{name} - {fake.text(max_nb_chars=100)}",
                    category=cat,
                    is_active=True,
                )
                styles.append(s)
            self.stdout.write(f"{len(styles)} styles created")
        else:
            styles = list(Style.objects.filter(organization=org))
            self.stdout.write(f"{len(styles)} styles already exist")

        status_choices_enquiry = ["received", "under_review", "quoted", "converted", "lost"]
        if not BuyerEnquiry.objects.filter(organization=org).exists():
            enquiries = []
            for _ in range(30):
                enquiries.append(
                    BuyerEnquiry(
                        organization=org,
                        buyer=random.choice(buyers),
                        style=random.choice(styles),
                        enquiry_date=fake.date_between(start_date="-3m", end_date="today"),
                        status=random.choice(status_choices_enquiry),
                        notes=fake.text(max_nb_chars=200),
                    )
                )
            BuyerEnquiry.objects.bulk_create(enquiries)
            self.stdout.write(f"{len(enquiries)} buyer enquiries created")
        else:
            self.stdout.write("BuyerEnquiry data already exists")

        po_statuses = ["draft", "confirmed", "in_production", "shipped", "delivered", "cancelled"]
        if not PurchaseOrder.objects.filter(organization=org).exists():
            pos = []
            for i in range(40):
                qty = random.randint(500, 50000)
                unit_price = Decimal(str(round(random.uniform(2.0, 50.0), 2)))
                pos.append(
                    PurchaseOrder(
                        organization=org,
                        buyer=random.choice(buyers),
                        style=random.choice(styles),
                        po_number=f"PO-{org.id:03d}-{i+1:05d}",
                        order_date=fake.date_between(start_date="-6m", end_date="-1m"),
                        delivery_date=fake.date_between(start_date="-1m", end_date="+3m"),
                        quantity=qty,
                        unit_price=unit_price,
                        total_value=Decimal(str(round(qty * float(unit_price), 2))),
                        status=random.choice(po_statuses),
                        notes=fake.text(max_nb_chars=150),
                    )
                )
            PurchaseOrder.objects.bulk_create(pos)
            self.stdout.write(f"{len(pos)} purchase orders created")
        else:
            self.stdout.write("PurchaseOrder data already exists")

        sample_types = ["fit", "pp", "size_set", "pre_production", "photo", "shipping"]
        sample_statuses = ["requested", "in_progress", "submitted", "approved", "rejected"]
        if not SampleOrder.objects.filter(organization=org).exists():
            samples = []
            for _ in range(35):
                samples.append(
                    SampleOrder(
                        organization=org,
                        buyer=random.choice(buyers),
                        style=random.choice(styles),
                        sample_type=random.choice(sample_types),
                        quantity=random.randint(2, 50),
                        request_date=fake.date_between(start_date="-4m", end_date="today"),
                        deadline=fake.date_between(start_date="-1m", end_date="+2m"),
                        status=random.choice(sample_statuses),
                        notes=fake.text(max_nb_chars=120),
                    )
                )
            SampleOrder.objects.bulk_create(samples)
            self.stdout.write(f"{len(samples)} sample orders created")
        else:
            self.stdout.write("SampleOrder data already exists")

        if not SMVRecord.objects.filter(style__in=styles).exists():
            smv_records = []
            for style in styles:
                for _ in range(random.randint(1, 4)):
                    smv_records.append(
                        SMVRecord(
                            style=style,
                            smv=Decimal(str(round(random.uniform(5.0, 60.0), 2))),
                            calculated_by=random.choice(employees).first_name + " " + random.choice(employees).last_name,
                            calculation_date=fake.date_between(start_date="-6m", end_date="today"),
                            notes=fake.text(max_nb_chars=100),
                        )
                    )
            SMVRecord.objects.bulk_create(smv_records)
            self.stdout.write(f"{len(smv_records)} SMV records created")
        else:
            self.stdout.write("SMVRecord data already exists")

        dev_stages = [
            "Pattern Making", "Sample Development", "Fitting",
            "Size Set Approval", "Pre-Production", "Production",
        ]
        dev_statuses = ["pending", "in_progress", "completed"]
        if not DevelopmentMonitoring.objects.filter(style__in=styles).exists():
            dev_records = []
            suppliers = [
                "Fabric Solutions Ltd.", "Trim House BD", "Accessory World",
                "Global Sourcing Inc.", "Prime Suppliers Ltd.",
            ]
            for style in random.sample(styles, min(len(styles), 10)):
                for stage in dev_stages:
                    start = fake.date_between(start_date="-4m", end_date="-1m")
                    dev_records.append(
                        DevelopmentMonitoring(
                            style=style,
                            supplier=random.choice(suppliers),
                            stage=stage,
                            start_date=start,
                            completion_date=start + timedelta(days=random.randint(5, 30)),
                            status=random.choice(dev_statuses),
                            notes=fake.text(max_nb_chars=80),
                        )
                    )
            DevelopmentMonitoring.objects.bulk_create(dev_records)
            self.stdout.write(f"{len(dev_records)} development monitoring records created")
        else:
            self.stdout.write("DevelopmentMonitoring data already exists")

        confidence_levels = ["high", "medium", "low"]
        if not BudgetDemandAssessment.objects.filter(organization=org).exists():
            budgets = []
            for buyer in buyers:
                for _ in range(random.randint(2, 5)):
                    fc_qty = random.randint(1000, 100000)
                    bk_qty = random.randint(0, fc_qty)
                    budgets.append(
                        BudgetDemandAssessment(
                            organization=org,
                            buyer=buyer,
                            assessment_date=fake.date_between(start_date="-6m", end_date="today"),
                            forecast_quantity=fc_qty,
                            booked_quantity=bk_qty,
                            gap_quantity=fc_qty - bk_qty,
                            revenue_estimate=Decimal(str(round(fc_qty * random.uniform(5.0, 30.0), 2))),
                            confidence=random.choice(confidence_levels),
                            notes=fake.text(max_nb_chars=150),
                        )
                    )
            BudgetDemandAssessment.objects.bulk_create(budgets)
            self.stdout.write(f"{len(budgets)} budget demand assessments created")
        else:
            self.stdout.write("BudgetDemandAssessment data already exists")

        ie_statuses = ["pending", "under_review", "implemented", "rejected"]
        operations = [
            "Front Placket Attach", "Collar Runstitch", "Sleeve Hem",
            "Side Seam", "Shoulder Join", "Label Attach",
            "Button Hole", "Button Sew", "Cuff Attach",
            "Yoke Join", "Pocket Set", "Waistband Attach",
        ]
        if not IeSuggestion.objects.filter(organization=org).exists():
            suggestions = []
            for line in lines:
                for _ in range(random.randint(2, 5)):
                    current = Decimal(str(round(random.uniform(10.0, 80.0), 2)))
                    target = current + Decimal(str(round(random.uniform(2.0, 20.0), 2)))
                    suggestions.append(
                        IeSuggestion(
                            organization=org,
                            production_line=line,
                            style=random.choice(styles),
                            operation=random.choice(operations),
                            current_pph=current,
                            target_pph=target,
                            description=fake.text(max_nb_chars=200),
                            status=random.choice(ie_statuses),
                        )
                    )
            IeSuggestion.objects.bulk_create(suggestions)
            self.stdout.write(f"{len(suggestions)} IE suggestions created")
        else:
            self.stdout.write("IeSuggestion data already exists")

        skill_names = [
            "Single Needle", "Overlock", "Flatlock",
            "Button Attach", "Bar Tack", "Snap Fastener",
            "Kansai Special", "Feed Off Arm", "Blind Stitch",
            "Double Needle",
        ]
        skill_levels = ["beginner", "intermediate", "expert"]
        if not SkillInventory.objects.filter(organization=org).exists():
            skills = []
            assigned_employees = set()
            for emp in employees:
                for _ in range(random.randint(1, 4)):
                    skill_entry = SkillInventory(
                        organization=org,
                        employee=emp,
                        operator_name=f"{emp.first_name} {emp.last_name}",
                        production_line=random.choice(lines),
                        skill_name=random.choice(skill_names),
                        skill_level=random.choice(skill_levels),
                        multi_skill=random.choice([True, False]),
                        last_assessed=fake.date_between(start_date="-1y", end_date="today"),
                        notes=fake.text(max_nb_chars=100),
                    )
                    skills.append(skill_entry)
            SkillInventory.objects.bulk_create(skills)
            self.stdout.write(f"{len(skills)} skill inventory records created")
        else:
            self.stdout.write("SkillInventory data already exists")

        downtime_causes = [
            "Power Outage", "Machine Breakdown", "Thread Breakage",
            "Needle Breakage", "Material Shortage", "Maintenance",
            "Operator Absence", "Quality Rework", "Setup Change",
        ]
        if not ProductionDowntime.objects.filter(organization=org).exists():
            downtimes = []
            for line in lines:
                for _ in range(random.randint(3, 8)):
                    start = fake.date_time_between(
                        start_date="-3m", end_date=timezone.now(), tzinfo=timezone.get_current_timezone()
                    )
                    duration = Decimal(str(round(random.uniform(0.5, 8.0), 2)))
                    downtimes.append(
                        ProductionDowntime(
                            organization=org,
                            production_line=line,
                            style=random.choice(styles),
                            start_datetime=start,
                            duration_hours=duration,
                            cause=random.choice(downtime_causes),
                            description=fake.text(max_nb_chars=150),
                            status=random.choice(["ongoing", "resolved"]),
                        )
                    )
            ProductionDowntime.objects.bulk_create(downtimes)
            self.stdout.write(f"{len(downtimes)} production downtime records created")
        else:
            self.stdout.write("ProductionDowntime data already exists")

        process_names = [
            "Cutting", "Sewing Line-A", "Sewing Line-B",
            "Embroidery", "Printing", "Finishing",
            "Inspection", "Ironing", "Packing",
            "Dispatch",
        ]
        if not ProcessWiseTarget.objects.filter(organization=org).exists():
            targets = []
            for pname in process_names:
                for _ in range(random.randint(2, 4)):
                    target_qty = random.randint(500, 20000)
                    achieved = random.randint(0, int(target_qty * 1.2))
                    variance = achieved - target_qty
                    if variance > 0:
                        status_p = "exceeded"
                    elif variance >= -int(target_qty * 0.1):
                        status_p = "on_track"
                    else:
                        status_p = "behind"
                    targets.append(
                        ProcessWiseTarget(
                            organization=org,
                            process_name=pname,
                            target_quantity=target_qty,
                            achieved_quantity=max(0, achieved),
                            variance=variance,
                            target_date=fake.date_between(start_date="-2m", end_date="+2m"),
                            status=status_p,
                            notes=fake.text(max_nb_chars=100),
                        )
                    )
            ProcessWiseTarget.objects.bulk_create(targets)
            self.stdout.write(f"{len(targets)} process-wise targets created")
        else:
            self.stdout.write("ProcessWiseTarget data already exists")

        self.stdout.write(self.style.SUCCESS("Seed completed successfully!"))
