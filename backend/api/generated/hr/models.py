from django.db import models
from django.conf import settings

class Attendance(models.Model):
    employee = models.IntegerField()
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('present', 'Present'), ('absent', 'Absent'), ('late', 'Late'), ('half_day', 'Half Day'), ('holiday', 'Holiday'), ('leave', 'Leave')])
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='attendance_set',
    )

    class Meta:
        db_table = 'attendance'
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'


class Bonus(models.Model):
    employee = models.IntegerField()
    bonus_type = models.CharField(max_length=50, choices=[('festival', 'Festival'), ('performance', 'Performance'), ('attendance', 'Attendance'), ('special', 'Special'), ('other', 'Other')])
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    bonus_date = models.DateField()
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('approved', 'Approved'), ('paid', 'Paid')])
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='bonus_set',
    )

    class Meta:
        db_table = 'bonus'
        verbose_name = 'Bonus'
        verbose_name_plural = 'Bonuss'
    def __str__(self):
        return str(getattr(self, 'description', ''))


class Department(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='department_set',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'department'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class Designation(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='designation_set',
    )
    department = models.IntegerField()
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    is_active = models.BooleanField()

    class Meta:
        db_table = 'designation'
        verbose_name = 'Designation'
        verbose_name_plural = 'Designations'
    def __str__(self):
        return str(getattr(self, 'name', ''))


class Employee(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='employee_set',
    )
    department = models.IntegerField(null=True, blank=True)
    designation = models.IntegerField(null=True, blank=True)
    location = models.IntegerField(null=True, blank=True)
    employee_id = models.CharField(max_length=50)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.CharField(max_length=254)
    phone = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)
    date_of_joining = models.DateField()
    employment_type = models.CharField(max_length=50, choices=[('permanent', 'Permanent'), ('contract', 'Contract'), ('probation', 'Probation'), ('intern', 'Intern'), ('temporary', 'Temporary')])
    gender = models.CharField(max_length=50, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other'), ('', '')])
    status = models.CharField(max_length=50, choices=[('active', 'Active'), ('inactive', 'Inactive'), ('resigned', 'Resigned'), ('terminated', 'Terminated')])
    is_active = models.BooleanField()

    class Meta:
        db_table = 'employee'
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'


class Leave(models.Model):
    employee = models.IntegerField()
    leave_type = models.CharField(max_length=50, choices=[('annual', 'Annual'), ('sick', 'Sick'), ('personal', 'Personal'), ('maternity', 'Maternity'), ('paternity', 'Paternity'), ('unpaid', 'Unpaid')])
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.CharField()
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('cancelled', 'Cancelled')])
    approved_by = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='leave_set',
    )

    class Meta:
        db_table = 'leave'
        verbose_name = 'Leave'
        verbose_name_plural = 'Leaves'


class Overtime(models.Model):
    employee = models.IntegerField()
    date = models.DateField()
    hours = models.DecimalField(max_digits=15, decimal_places=2)
    rate = models.DecimalField(max_digits=15, decimal_places=2)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('paid', 'Paid')])
    approved_by = models.CharField(max_length=255)
    notes = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='overtime_set',
    )

    class Meta:
        db_table = 'overtime'
        verbose_name = 'Overtime'
        verbose_name_plural = 'Overtimes'


class SalarySheet(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='salary_sheet_set',
    )
    employee = models.IntegerField()
    month = models.CharField(max_length=7)
    basic_salary = models.DecimalField(max_digits=15, decimal_places=2)
    allowances = models.DecimalField(max_digits=15, decimal_places=2)
    deductions = models.DecimalField(max_digits=15, decimal_places=2)
    overtime_amount = models.DecimalField(max_digits=15, decimal_places=2)
    bonus_amount = models.DecimalField(max_digits=15, decimal_places=2)
    net_salary = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('approved', 'Approved'), ('paid', 'Paid')])
    payment_date = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=255)

    class Meta:
        db_table = 'salary_sheet'
        verbose_name = 'SalarySheet'
        verbose_name_plural = 'SalarySheets'

