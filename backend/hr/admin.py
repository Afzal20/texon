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
    list_display = ("name", "code", "organization", "is_active", "created_at")
    list_filter = ("is_active", "organization")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "department", "is_active", "created_at")
    list_filter = ("is_active", "department")
    search_fields = ("name", "code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "first_name", "last_name", "department", "designation", "email", "employment_type", "status")
    list_filter = ("status", "department", "designation", "employment_type", "gender", "is_active")
    search_fields = ("employee_id", "first_name", "last_name", "email", "phone")
    date_hierarchy = "date_of_joining"
    readonly_fields = ("created_at", "updated_at")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "check_in", "check_out", "status")
    list_filter = ("status", "date")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "total_days", "status", "created_at")
    list_filter = ("leave_type", "status")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name", "reason")
    date_hierarchy = "start_date"
    readonly_fields = ("created_at", "updated_at")


@admin.register(Overtime)
class OvertimeAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "hours", "rate", "total_amount", "status")
    list_filter = ("status", "date")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")


@admin.register(SalarySheet)
class SalarySheetAdmin(admin.ModelAdmin):
    list_display = ("employee", "month", "basic_salary", "allowances", "deductions", "net_salary", "status", "payment_date")
    list_filter = ("status", "month", "organization")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Bonus)
class BonusAdmin(admin.ModelAdmin):
    list_display = ("employee", "bonus_type", "amount", "bonus_date", "status", "created_at")
    list_filter = ("bonus_type", "status")
    search_fields = ("employee__employee_id", "employee__first_name", "employee__last_name", "description")
    date_hierarchy = "bonus_date"
    readonly_fields = ("created_at",)
