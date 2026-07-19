from __future__ import annotations

from django.db.models import Q
from hr.models import Attendance, Bonus, Employee, Leave, Overtime, SalarySheet

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class EmployeeSkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "employee"

    @property
    def description(self) -> str:
        return "Employee management — profiles, attendance, leave, overtime, salary, and bonuses."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "search_employees",
                "Search employees by name, employee ID, department, or designation.",
                {
                    "query": {"type": "string", "description": "Search term for name, ID, department, or designation"},
                    "department": {"type": "string", "description": "Filter by department name"},
                    "status": {"type": "string", "enum": ["active", "inactive", "resigned", "terminated"], "description": "Filter by employment status"},
                },
                [],
            ),
            self._make_tool(
                "employee_profile",
                "Get detailed profile for an employee by employee ID.",
                {"employee_id": {"type": "string", "description": "Employee ID (e.g., E001)"}},
                ["employee_id"],
            ),
            self._make_tool(
                "get_attendance",
                "Get attendance records for an employee.",
                {
                    "employee_id": {"type": "string", "description": "Employee ID"},
                    "from_date": {"type": "string", "description": "Start date (YYYY-MM-DD)"},
                    "to_date": {"type": "string", "description": "End date (YYYY-MM-DD)"},
                },
                ["employee_id"],
            ),
            self._make_tool(
                "get_leave_balance",
                "Get leave balance and history for an employee.",
                {"employee_id": {"type": "string", "description": "Employee ID"}},
                ["employee_id"],
            ),
            self._make_tool(
                "get_salary_info",
                "Get salary details for an employee for a specific month or latest.",
                {
                    "employee_id": {"type": "string", "description": "Employee ID"},
                    "month": {"type": "string", "description": "Month in YYYY-MM format (optional, returns latest if omitted)"},
                },
                ["employee_id"],
            ),
            self._make_tool(
                "get_overtime",
                "Get overtime records for an employee.",
                {
                    "employee_id": {"type": "string", "description": "Employee ID"},
                    "from_date": {"type": "string", "description": "Start date (YYYY-MM-DD)"},
                    "to_date": {"type": "string", "description": "End date (YYYY-MM-DD)"},
                },
                ["employee_id"],
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "search_employees": self._search_employees,
            "employee_profile": self._employee_profile,
            "get_attendance": self._get_attendance,
            "get_leave_balance": self._get_leave_balance,
            "get_salary_info": self._get_salary_info,
            "get_overtime": self._get_overtime,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _search_employees(self, query: str = "", department: str = "", status: str = "") -> SkillResult:
        qs = Employee.objects.select_related("department", "designation").all()
        if query:
            qs = qs.filter(
                Q(employee_id__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(department__name__icontains=query)
                | Q(designation__name__icontains=query)
            )
        if department:
            qs = qs.filter(department__name__icontains=department)
        if status:
            qs = qs.filter(status=status)
        data = list(qs.values("employee_id", "first_name", "last_name", "email", "department__name", "designation__name", "status")[:20])
        return self._success(data, tool_name="search_employees")

    def _employee_profile(self, employee_id: str) -> SkillResult:
        try:
            emp = Employee.objects.select_related("department", "designation", "location").get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return self._error(f"Employee not found: {employee_id}")
        return self._success({
            "employee_id": emp.employee_id,
            "name": f"{emp.first_name} {emp.last_name}",
            "email": emp.email,
            "phone": emp.phone,
            "department": emp.department.name if emp.department else None,
            "designation": emp.designation.name if emp.designation else None,
            "employment_type": emp.employment_type,
            "status": emp.status,
            "date_of_joining": str(emp.date_of_joining),
            "date_of_birth": str(emp.date_of_birth) if emp.date_of_birth else None,
        }, tool_name="employee_profile")

    def _get_attendance(self, employee_id: str, from_date: str = "", to_date: str = "") -> SkillResult:
        try:
            emp = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return self._error(f"Employee not found: {employee_id}")
        qs = Attendance.objects.filter(employee=emp).order_by("-date")
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)
        data = list(qs.values("date", "check_in", "check_out", "status")[:30])
        return self._success(data, tool_name="get_attendance")

    def _get_leave_balance(self, employee_id: str) -> SkillResult:
        try:
            emp = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return self._error(f"Employee not found: {employee_id}")
        leaves = Leave.objects.filter(employee=emp).order_by("-start_date")
        total_leaves = leaves.count()
        pending = leaves.filter(status="pending").count()
        approved = leaves.filter(status="approved").count()
        recent = list(leaves.values("leave_type", "start_date", "end_date", "total_days", "status")[:10])
        return self._success({
            "employee_id": employee_id,
            "total_leave_applications": total_leaves,
            "pending": pending,
            "approved": approved,
            "recent_leaves": recent,
        }, tool_name="get_leave_balance")

    def _get_salary_info(self, employee_id: str, month: str = "") -> SkillResult:
        try:
            emp = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return self._error(f"Employee not found: {employee_id}")
        qs = SalarySheet.objects.filter(employee=emp).order_by("-month")
        if month:
            qs = qs.filter(month=month)
        data = list(qs.values("month", "basic_salary", "allowances", "deductions", "overtime_amount", "bonus_amount", "net_salary", "status")[:12])
        return self._success(data, tool_name="get_salary_info")

    def _get_overtime(self, employee_id: str, from_date: str = "", to_date: str = "") -> SkillResult:
        try:
            emp = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return self._error(f"Employee not found: {employee_id}")
        qs = Overtime.objects.filter(employee=emp).order_by("-date")
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)
        data = list(qs.values("date", "hours", "rate", "total_amount", "status")[:30])
        return self._success(data, tool_name="get_overtime")
