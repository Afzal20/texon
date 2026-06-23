from django.contrib import admin
from .models import EmployeeGrade, Department, Designation, Employee, Attendance, LeaveRequest, PayrollRun, PayrollEntry, ShiftRotation, ShiftSchedule

@admin.register(EmployeeGrade)
class EmployeeGradeAdmin(admin.ModelAdmin):
    list_display = ('name', 'basic_salary', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'first_name', 'last_name', 'department', 'designation', 'grade', 'is_active', 'organization')
    search_fields = ('employee_id', 'first_name', 'last_name')
    list_filter = ('organization', 'department', 'designation', 'grade', 'is_active')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'check_in', 'check_out', 'status')
    search_fields = ('employee__employee_id', 'employee__first_name')
    list_filter = ('date', 'status')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'start_date', 'end_date', 'leave_type', 'status')
    search_fields = ('employee__employee_id',)
    list_filter = ('status', 'leave_type')

class PayrollEntryInline(admin.TabularInline):
    model = PayrollEntry
    extra = 1

@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ('month', 'year', 'status', 'created_at', 'organization')
    search_fields = ('year',)
    list_filter = ('organization', 'status', 'month', 'year')
    inlines = [PayrollEntryInline]

@admin.register(PayrollEntry)
class PayrollEntryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'payroll_run', 'basic_salary', 'allowances', 'deductions', 'net_salary')
    search_fields = ('employee__employee_id',)

@admin.register(ShiftRotation)
class ShiftRotationAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization')
    search_fields = ('name',)
    list_filter = ('organization',)

@admin.register(ShiftSchedule)
class ShiftScheduleAdmin(admin.ModelAdmin):
    list_display = ('employee', 'shift', 'week_number')
    search_fields = ('employee__employee_id', 'week_number')
    list_filter = ('shift', 'week_number')
