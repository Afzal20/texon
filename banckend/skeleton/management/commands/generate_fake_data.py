from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker
import random
from users.models import CustomUser, Organization
from hr.models import EmployeeGrade, Department, Designation, Employee
from inventory.models import Warehouse, WarehouseZone, InventoryItem, StockTransaction, StockLevel

class Command(BaseCommand):
    help = 'Generates fake data for MVP demonstration'

    def handle(self, *args, **kwargs):
        fake = Faker()
        
        with transaction.atomic():
            self.stdout.write("Creating Organization...")
            org, created = Organization.objects.get_or_create(
                name="Texon Apparel Ltd.",
                defaults={
                    'code': 'TEXON',
                }
            )

            self.stdout.write("Creating Admin User...")
            admin_email = "admin@texon.local"
            if not CustomUser.objects.filter(email=admin_email).exists():
                admin = CustomUser.objects.create_superuser(
                    email=admin_email,
                    password="password123!",
                    organization=org,
                )
            
            self.stdout.write("Creating HR Data...")
            grade, _ = EmployeeGrade.objects.get_or_create(organization=org, name="A", basic_salary=50000)
            dept, _ = Department.objects.get_or_create(organization=org, name="Production")
            desig, _ = Designation.objects.get_or_create(organization=org, name="Sewing Operator")

            for i in range(10):
                Employee.objects.get_or_create(
                    organization=org,
                    employee_id=f"EMP{1000+i}",
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    grade=grade,
                    department=dept,
                    designation=desig,
                )

            self.stdout.write("Creating Inventory Data...")
            warehouse, _ = Warehouse.objects.get_or_create(organization=org, name="Main Warehouse")
            zone, _ = WarehouseZone.objects.get_or_create(warehouse=warehouse, code="Zone-A1")

            items = []
            for i in range(5):
                item, _ = InventoryItem.objects.get_or_create(
                    organization=org,
                    sku=f"FAB{100+i}",
                    name=f"Cotton Fabric {fake.color_name()}",
                    description="High quality cotton.",
                    unit_of_measure="yards"
                )
                items.append(item)
            
            for item in items:
                qty = random.randint(500, 2000)
                StockTransaction.objects.get_or_create(
                    organization=org,
                    inventory_item=item,
                    transaction_type="receive",
                    quantity=qty,
                    to_zone=zone,
                )
                StockLevel.objects.get_or_create(
                    warehouse_zone=zone,
                    inventory_item=item,
                    current_stock=qty
                )

        self.stdout.write(self.style.SUCCESS("Successfully generated fake data."))
        self.stdout.write("Login email: admin@texon.local")
        self.stdout.write("Password: password123!")
