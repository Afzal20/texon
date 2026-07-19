from django.db import migrations

DEPARTMENTS = [
    {"name": "Cutting", "code": "CUT"},
    {"name": "Sewing", "code": "SEW"},
    {"name": "Finishing", "code": "FIN"},
    {"name": "Quality Control", "code": "QC"},
    {"name": "Finance & Accounts", "code": "FINACC"},
    {"name": "Human Resources", "code": "HR"},
    {"name": "Merchandising", "code": "MERCH"},
    {"name": "Administration", "code": "ADMIN"},
    {"name": "IT", "code": "IT"},
]


def seed_departments(apps, schema_editor):
    Organization = apps.get_model("core", "Organization")
    Department = apps.get_model("hr", "Department")
    org, _ = Organization.objects.get_or_create(
        code="DEFAULT", defaults={"name": "Default Organization"}
    )
    for dept in DEPARTMENTS:
        Department.objects.get_or_create(
            organization=org, code=dept["code"], defaults={"name": dept["name"]}
        )


def reverse_seed(apps, schema_editor):
    Department = apps.get_model("hr", "Department")
    Department.objects.filter(code__in=[d["code"] for d in DEPARTMENTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("hr", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_departments, reverse_seed),
    ]
