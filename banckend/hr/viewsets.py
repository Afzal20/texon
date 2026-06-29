from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from skeleton.pagination import ProductionPagination
from skeleton.permissions import IsOrganizationMember

from .models import (
    EmployeeGrade, Department, Designation, Employee,
    Attendance, LeaveRequest, PayrollRun, PayrollEntry,
    ShiftRotation, ShiftSchedule
)
from .serializers import (
    EmployeeGradeSerializer, DepartmentSerializer, DesignationSerializer,
    EmployeeSerializer, AttendanceSerializer, LeaveRequestSerializer,
    PayrollRunSerializer, PayrollEntrySerializer, ShiftRotationSerializer,
    ShiftScheduleSerializer
)
from .filters import (
    EmployeeFilter, AttendanceFilter, LeaveRequestFilter,
    PayrollRunFilter, PayrollEntryFilter, ShiftScheduleFilter
)

class BaseHRViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class EmployeeGradeViewSet(BaseHRViewSet):
    queryset = EmployeeGrade.objects.all()
    serializer_class = EmployeeGradeSerializer

class DepartmentViewSet(BaseHRViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class DesignationViewSet(BaseHRViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer

class EmployeeViewSet(BaseHRViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filterset_class = EmployeeFilter

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = AttendanceFilter

    def get_queryset(self):
        return self.queryset.filter(employee__organization=self.request.user.organization)

    @action(detail=False, methods=['post'])
    def bulk_check_in(self, request):
        # Allow passing a list of employee IDs and checking them all in
        pass

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = LeaveRequestFilter

    def get_queryset(self):
        return self.queryset.filter(employee__organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'approved'
        leave.reviewed_by = request.user
        leave.save()
        return Response({'status': 'Leave request approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'rejected'
        leave.reviewed_by = request.user
        leave.save()
        return Response({'status': 'Leave request rejected'})

class PayrollRunViewSet(BaseHRViewSet):
    queryset = PayrollRun.objects.all()
    serializer_class = PayrollRunSerializer
    filterset_class = PayrollRunFilter

class PayrollEntryViewSet(viewsets.ModelViewSet):
    queryset = PayrollEntry.objects.all()
    serializer_class = PayrollEntrySerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PayrollEntryFilter

    def get_queryset(self):
        return self.queryset.filter(payroll_run__organization=self.request.user.organization)

class ShiftRotationViewSet(BaseHRViewSet):
    queryset = ShiftRotation.objects.all()
    serializer_class = ShiftRotationSerializer

class ShiftScheduleViewSet(viewsets.ModelViewSet):
    queryset = ShiftSchedule.objects.all()
    serializer_class = ShiftScheduleSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ShiftScheduleFilter

    def get_queryset(self):
        return self.queryset.filter(employee__organization=self.request.user.organization)
