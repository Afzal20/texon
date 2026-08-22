from django.db import models
from core.models import Location


class Department(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        unique_together = ("code",)

    def __str__(self):
        return self.name


class Designation(models.Model):
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="designations"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Designation"
        verbose_name_plural = "Designations"
        unique_together = ("code",)

    def __str__(self):
        return f"{self.name} - {self.department.name}"


class Employee(models.Model):
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees"
    )
    designation = models.ForeignKey(
        Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees"
    )
    location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees"
    )
    employee_id = models.CharField(max_length=50)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    date_of_joining = models.DateField()
    employment_type = models.CharField(
        max_length=50,
        choices=[
            ("permanent", "Permanent"),
            ("contract", "Contractual"),
            ("probation", "Probation"),
            ("intern", "Intern"),
            ("temporary", "Temporary"),
        ],
        default="permanent",
    )
    gender = models.CharField(
        max_length=20,
        choices=[("male", "Male"), ("female", "Female"), ("other", "Other")],
        blank=True,
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("resigned", "Resigned"),
            ("terminated", "Terminated"),
        ],
        default="active",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        unique_together = ("employee_id",)

    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"


class Attendance(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="attendance_records"
    )
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("present", "Present"),
            ("absent", "Absent"),
            ("late", "Late"),
            ("half_day", "Half Day"),
            ("holiday", "Holiday"),
            ("leave", "On Leave"),
        ],
        default="present",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Attendance"
        verbose_name_plural = "Attendances"
        unique_together = ("employee", "date")

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date} - {self.status}"


class Leave(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="leaves"
    )
    leave_type = models.CharField(
        max_length=50,
        choices=[
            ("annual", "Annual Leave"),
            ("sick", "Sick Leave"),
            ("personal", "Personal Leave"),
            ("maternity", "Maternity Leave"),
            ("paternity", "Paternity Leave"),
            ("unpaid", "Unpaid Leave"),
        ],
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"), ("cancelled", "Cancelled")],
        default="pending",
    )
    approved_by = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Leave"
        verbose_name_plural = "Leaves"

    def __str__(self):
        return f"{self.employee.employee_id} - {self.leave_type} - {self.start_date}"


class Overtime(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="overtime_records"
    )
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[("pending", "Pending"), ("approved", "Approved"), ("paid", "Paid")],
        default="pending",
    )
    approved_by = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Overtime"
        verbose_name_plural = "Overtimes"

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date} - {self.hours}h"


class SalarySheet(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="salary_sheets"
    )
    month = models.CharField(max_length=7, help_text="YYYY-MM format")
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    overtime_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonus_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=[("draft", "Draft"), ("approved", "Approved"), ("paid", "Paid")],
        default="draft",
    )
    payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "SalarySheet"
        verbose_name_plural = "SalarySheets"

    def __str__(self):
        return f"{self.employee.employee_id} - {self.month}"


class Bonus(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="bonuses"
    )
    bonus_type = models.CharField(
        max_length=50,
        choices=[
            ("festival", "Festival Bonus"),
            ("performance", "Performance Bonus"),
            ("attendance", "Attendance Bonus"),
            ("special", "Special Bonus"),
            ("other", "Other"),
        ],
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bonus_date = models.DateField()
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("approved", "Approved"), ("paid", "Paid")],
        default="approved",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bonus"
        verbose_name_plural = "Bonus"

    def __str__(self):
        return f"{self.employee.employee_id} - {self.bonus_type} - {self.amount}"
