import re

from rest_framework import serializers

from core.models import Location, Organization

from .models import Attendance, Bonus, Department, Designation, Employee, Leave, Overtime, SalarySheet


class DepartmentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )

    class Meta:
        model = Department
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_code(self, value):
        org_id = self._get_org_id()
        if org_id:
            qs = Department.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A department with this code already exists in this organization.",
                )
        return value

    def _get_org_id(self):
        if self.instance:
            return self.instance.organization_id
        return self.initial_data.get("organization")


class DesignationSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )
    department = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Department.objects.all(),
    )

    class Meta:
        model = Designation
        fields = [
            "id",
            "organization",
            "department",
            "name",
            "code",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_code(self, value):
        org_id = self._get_org_id()
        if org_id:
            qs = Designation.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A designation with this code already exists in this organization.",
                )
        return value

    def _get_org_id(self):
        if self.instance:
            return self.instance.organization_id
        return self.initial_data.get("organization")


class EmployeeSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )
    department = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Department.objects.all(),
        allow_null=True,
        required=False,
    )
    designation = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Designation.objects.all(),
        allow_null=True,
        required=False,
    )
    location = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Location.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "organization",
            "department",
            "designation",
            "location",
            "employee_id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "date_of_birth",
            "date_of_joining",
            "employment_type",
            "gender",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_email(self, value):
        qs = Employee.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value.lower()

    def validate_employee_id(self, value):
        org_id = self._get_org_id()
        if org_id:
            qs = Employee.objects.filter(organization_id=org_id, employee_id__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "An employee with this ID already exists in this organization.",
                )
        return value

    def _get_org_id(self):
        if self.instance:
            return self.instance.organization_id
        return self.initial_data.get("organization")


class AttendanceSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Employee.objects.all(),
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "date",
            "check_in",
            "check_out",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        cin = attrs.get("check_in")
        cout = attrs.get("check_out")
        if cin and cout and cout <= cin:
            raise serializers.ValidationError("Check-out time must be after check-in time.")
        return attrs


class LeaveSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Employee.objects.all(),
    )

    class Meta:
        model = Leave
        fields = [
            "id",
            "employee",
            "leave_type",
            "start_date",
            "end_date",
            "total_days",
            "reason",
            "status",
            "approved_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")
        return attrs


class OvertimeSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Employee.objects.all(),
    )

    class Meta:
        model = Overtime
        fields = [
            "id",
            "employee",
            "date",
            "hours",
            "rate",
            "total_amount",
            "status",
            "approved_by",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError("Hours must be positive.")
        if value > 24:
            raise serializers.ValidationError("Hours cannot exceed 24 in a single day.")
        return value


class SalarySheetSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )
    employee = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Employee.objects.all(),
    )

    class Meta:
        model = SalarySheet
        fields = [
            "id",
            "organization",
            "employee",
            "month",
            "basic_salary",
            "allowances",
            "deductions",
            "overtime_amount",
            "bonus_amount",
            "net_salary",
            "status",
            "payment_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_month(self, value):
        if not re.match(r"^\d{4}-\d{2}$", value):
            raise serializers.ValidationError("Month must be in YYYY-MM format.")
        return value


class BonusSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Employee.objects.all(),
    )

    class Meta:
        model = Bonus
        fields = [
            "id",
            "employee",
            "bonus_type",
            "amount",
            "bonus_date",
            "description",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bonus amount must be positive.")
        return value
