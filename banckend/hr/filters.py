import django_filters
from .models import (
    Employee, Attendance, LeaveRequest, PayrollRun, PayrollEntry, ShiftSchedule
)

class EmployeeFilter(django_filters.FilterSet):
    first_name = django_filters.CharFilter(lookup_expr='icontains')
    last_name = django_filters.CharFilter(lookup_expr='icontains')
    employee_id = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Employee
        fields = ['first_name', 'last_name', 'employee_id', 'grade', 'department', 'designation', 'is_active']

class AttendanceFilter(django_filters.FilterSet):
    employee_id = django_filters.CharFilter(field_name='employee__employee_id', lookup_expr='icontains')
    date = django_filters.DateFilter()
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Attendance
        fields = ['employee', 'employee_id', 'date', 'status']

class LeaveRequestFilter(django_filters.FilterSet):
    employee_id = django_filters.CharFilter(field_name='employee__employee_id', lookup_expr='icontains')
    start_date = django_filters.DateFilter(lookup_expr='gte')

    class Meta:
        model = LeaveRequest
        fields = ['employee', 'employee_id', 'status', 'leave_type']

class PayrollRunFilter(django_filters.FilterSet):
    class Meta:
        model = PayrollRun
        fields = ['month', 'year', 'status']

class PayrollEntryFilter(django_filters.FilterSet):
    employee_id = django_filters.CharFilter(field_name='employee__employee_id', lookup_expr='icontains')

    class Meta:
        model = PayrollEntry
        fields = ['payroll_run', 'employee', 'employee_id']

class ShiftScheduleFilter(django_filters.FilterSet):
    employee_id = django_filters.CharFilter(field_name='employee__employee_id', lookup_expr='icontains')
    
    class Meta:
        model = ShiftSchedule
        fields = ['employee', 'employee_id', 'shift', 'week_number']
