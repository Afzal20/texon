from rest_framework import serializers
from .models import (
    EmployeeGrade, Department, Designation, Employee,
    Attendance, LeaveRequest, PayrollRun, PayrollEntry,
    ShiftRotation, ShiftSchedule
)

class EmployeeGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeGrade
        fields = ['id', 'organization', 'name', 'basic_salary']
        read_only_fields = ['id', 'organization']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'organization', 'name']
        read_only_fields = ['id', 'organization']

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ['id', 'organization', 'name']
        read_only_fields = ['id', 'organization']

class EmployeeSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'organization', 'first_name', 'last_name', 'employee_id',
            'grade', 'grade_name', 'department', 'department_name',
            'designation', 'designation_name', 'date_joined', 'is_active'
        ]
        read_only_fields = ['id', 'organization']

class AttendanceSerializer(serializers.ModelSerializer):
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_id_code', 'employee_name',
            'date', 'check_in', 'check_out', 'status'
        ]
        read_only_fields = ['id']

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    reviewed_by_email = serializers.CharField(source='reviewed_by.email', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_id_code', 'start_date', 'end_date',
            'leave_type', 'reason', 'status', 'reviewed_by', 'reviewed_by_email', 'created_at'
        ]
        read_only_fields = ['id', 'reviewed_by', 'created_at']

class PayrollRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRun
        fields = ['id', 'organization', 'month', 'year', 'status', 'created_at']
        read_only_fields = ['id', 'organization', 'created_at']

class PayrollEntrySerializer(serializers.ModelSerializer):
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = PayrollEntry
        fields = [
            'id', 'payroll_run', 'employee', 'employee_id_code',
            'basic_salary', 'allowances', 'deductions', 'net_salary'
        ]
        read_only_fields = ['id']

class ShiftRotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftRotation
        fields = ['id', 'organization', 'name', 'rotation_rules']
        read_only_fields = ['id', 'organization']

class ShiftScheduleSerializer(serializers.ModelSerializer):
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)

    class Meta:
        model = ShiftSchedule
        fields = [
            'id', 'employee', 'employee_id_code', 'shift', 'shift_name',
            'week_number', 'assigned_at'
        ]
        read_only_fields = ['id', 'assigned_at']
