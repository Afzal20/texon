from rest_framework import serializers
from .models import *

class AttendanceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class BonusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Bonus
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DesignationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Designation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmployeeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LeaveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class OvertimeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Overtime
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SalarySheetSerializer(serializers.ModelSerializer):

    class Meta:
        model = SalarySheet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
