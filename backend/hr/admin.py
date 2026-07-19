from django.contrib import admin

from .models import (
    Attendance,
    Bonus,
    Department,
    Designation,
    Employee,
    Leave,
    Overtime,
    SalarySheet,
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "is_active")
    search_fields = ("name", "code")


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "department", "is_active")
    search_fields = ("name", "code")


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "first_name", "last_name", "department", "designation", "email", "status")
    search_fields = ("employee_id", "first_name", "last_name", "email")
    list_filter = ("status", "department", "employment_type")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "check_in", "check_out", "status")
    list_filter = ("status",)
    date_hierarchy = "date"


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "total_days", "status")
    list_filter = ("leave_type", "status")


@admin.register(Overtime)
class OvertimeAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "hours", "rate", "total_amount", "status")
    list_filter = ("status",)


@admin.register(SalarySheet)
class SalarySheetAdmin(admin.ModelAdmin):
    list_display = ("employee", "month", "basic_salary", "net_salary", "status", "payment_date")
    list_filter = ("status", "month")


@admin.register(Bonus)
class BonusAdmin(admin.ModelAdmin):
    list_display = ("employee", "bonus_type", "amount", "bonus_date", "status")
    list_filter = ("bonus_type", "status")
