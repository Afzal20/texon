from django.db import models
from auditlog.registry import auditlog

class EmployeeGrade(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="employee_grades")
    name = models.CharField(max_length=50)  # A-Grade, B-Grade
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.name

class Department(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="departments")
    name = models.CharField(max_length=100)  # Sewing, Finishing

    def __str__(self):
        return self.name

class Designation(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="designations")
    name = models.CharField(max_length=100)  # Sewing Operator, Supervisor

    def __str__(self):
        return self.name

class Employee(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="employees")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=50, unique=True)
    grade = models.ForeignKey(EmployeeGrade, on_delete=models.SET_NULL, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True)
    date_joined = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendance")
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default="present")  # present, absent, late, leave

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date} ({self.status})"

class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    start_date = models.DateField()
    end_date = models.DateField()
    leave_type = models.CharField(max_length=50)
    reason = models.TextField()
    status = models.CharField(max_length=50, default="pending")  # pending, approved, rejected
    reviewed_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Leave: {self.employee.employee_id} ({self.start_date} to {self.end_date})"

class PayrollRun(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="payroll_runs")
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    status = models.CharField(max_length=50, default="draft")  # draft, verified, processed
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payroll {self.month}/{self.year}"

class PayrollEntry(models.Model):
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="entries")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="payroll_entries")
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.employee.employee_id} - Net: {self.net_salary}"

class ShiftRotation(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="shift_rotations")
    name = models.CharField(max_length=100)  # Day/Night/General
    rotation_rules = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class ShiftSchedule(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="shift_schedules")
    shift = models.ForeignKey('production.ProductionShift', on_delete=models.CASCADE)
    week_number = models.CharField(max_length=50)  # e.g., "2026-W42"
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.shift.name} ({self.week_number})"

auditlog.register(EmployeeGrade)
auditlog.register(Department)
auditlog.register(Designation)
auditlog.register(Employee)
auditlog.register(Attendance)
auditlog.register(LeaveRequest)
auditlog.register(PayrollRun)
auditlog.register(PayrollEntry)
auditlog.register(ShiftRotation)
auditlog.register(ShiftSchedule)
