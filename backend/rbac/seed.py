import os, sys, random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import django
django.setup()

from authentication.models import User
from rbac.models import Permission, Role, RolePermission, UserRole

print("Seeding rbac data...")

def get_user(email):
    user = User.objects.filter(email=email).first()
    if user:
        return user
    return User.objects.create_user(email=email, password="Test@123")

PERMISSIONS = [
    ("dashboard.view", "View Dashboard", "dashboard"),
    ("users.view", "View Users", "users"),
    ("users.create", "Create Users", "users"),
    ("users.update", "Update Users", "users"),
    ("users.delete", "Delete Users", "users"),
    ("roles.manage", "Manage Roles & Permissions", "users"),
    ("salary.view", "View Salary", "salary"),
    ("salary.approve", "Approve Salary", "salary"),
    ("salary.manage", "Manage Salary Sheets", "salary"),
    ("orders.view", "View Orders", "orders"),
    ("orders.create", "Create Orders", "orders"),
    ("orders.approve", "Approve Orders", "orders"),
    ("buyers.view", "View Buyers", "buyers"),
    ("buyers.manage", "Manage Buyers", "buyers"),
    ("procurement.view", "View Procurement", "procurement"),
    ("procurement.manage", "Manage Procurement", "procurement"),
    ("inventory.view", "View Inventory", "inventory"),
    ("inventory.manage", "Manage Inventory", "inventory"),
    ("quality.view", "View Quality", "quality"),
    ("quality.manage", "Manage Quality Reports", "quality"),
    ("ie.view", "View IE Data", "ie"),
    ("ie.manage", "Manage IE Planning", "ie"),
    ("attendance.view", "View Attendance", "attendance"),
    ("attendance.approve", "Approve Attendance", "attendance"),
    ("reports.view", "View Reports", "reports"),
]

# ── Permissions ─────────────────────────────────────────────────────────────
for codename, label, group in PERMISSIONS:
    Permission.objects.get_or_create(codename=codename, defaults={"label": label, "group": group})

# ── Roles ───────────────────────────────────────────────────────────────────
roles = []
for name, desc, is_system in [
    ("Admin", "Full system access. System role, cannot be deleted.", True),
    ("Manager", "Department managers with broad operational access.", False),
    ("Merchandiser", "Handles buyer orders, samples and procurement.", False),
    ("HR Manager", "Manages employees, salary and attendance.", False),
    ("Quality Manager", "Oversees quality control and inspections.", False),
    ("IE Executive", "Industrial engineering and production planning.", False),
]:
    r, _ = Role.objects.get_or_create(name=name, defaults={"description": desc, "is_system": is_system})
    roles.append(r)

# ── Role Permissions ────────────────────────────────────────────────────────
def grant(role_name, *codenames):
    role = Role.objects.get(name=role_name)
    for codename in codenames:
        perm = Permission.objects.get(codename=codename)
        RolePermission.objects.get_or_create(role=role, permission=perm)

grant("Admin", *[c for c, _, _ in PERMISSIONS])
grant("Manager", "dashboard.view", "users.view", "orders.view", "orders.create", "orders.approve",
      "buyers.view", "buyers.manage", "procurement.view", "procurement.manage", "inventory.view",
      "inventory.manage", "attendance.view", "attendance.approve", "reports.view")
grant("Merchandiser", "dashboard.view", "orders.view", "orders.create", "buyers.view", "procurement.view",
      "inventory.view", "reports.view")
grant("HR Manager", "dashboard.view", "users.view", "users.create", "users.update", "salary.view",
      "salary.approve", "salary.manage", "attendance.view", "attendance.approve", "reports.view")
grant("Quality Manager", "dashboard.view", "quality.view", "quality.manage", "orders.view", "reports.view")
grant("IE Executive", "dashboard.view", "ie.view", "ie.manage", "orders.view", "reports.view")

# ── User Roles ──────────────────────────────────────────────────────────────
for email, role_name in [
    ("admin@texon.com", "Admin"),
    ("merchant@texon.com", "Merchandiser"),
    ("hr@texon.com", "HR Manager"),
    ("quality@texon.com", "Quality Manager"),
    ("ie@texon.com", "IE Executive"),
    ("finance@texon.com", "Manager"),
]:
    user = get_user(email)
    role = Role.objects.get(name=role_name)
    UserRole.objects.get_or_create(user=user, role=role)

# ── Summary ──────────────────────────────────────────────────────────────────
for model, label in [
    (Permission, "Permissions"), (Role, "Roles"),
    (RolePermission, "Role Permissions"), (UserRole, "User Roles"),
]:
    print(f"  {label}: {model.objects.count()}")
print("Done!")
