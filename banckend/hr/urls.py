from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    EmployeeGradeViewSet, DepartmentViewSet, DesignationViewSet,
    EmployeeViewSet, AttendanceViewSet, LeaveRequestViewSet,
    PayrollRunViewSet, PayrollEntryViewSet, ShiftRotationViewSet,
    ShiftScheduleViewSet
)

router = DefaultRouter()
router.register(r'grades', EmployeeGradeViewSet, basename='employee-grade')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'payroll-runs', PayrollRunViewSet, basename='payroll-run')
router.register(r'payroll-entries', PayrollEntryViewSet, basename='payroll-entry')
router.register(r'shift-rotations', ShiftRotationViewSet, basename='shift-rotation')
router.register(r'shift-schedules', ShiftScheduleViewSet, basename='shift-schedule')

urlpatterns = [
    path('', include(router.urls)),
]
