from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'bonuses', views.BonusViewSet, basename='bonuses')
router.register(r'departments', views.DepartmentViewSet, basename='departments')
router.register(r'designations', views.DesignationViewSet, basename='designations')
router.register(r'employees', views.EmployeeViewSet, basename='employees')
router.register(r'leaves', views.LeaveViewSet, basename='leaves')
router.register(r'overtime', views.OvertimeViewSet, basename='overtime')
router.register(r'salary-sheets', views.SalarySheetViewSet, basename='salary-sheets')

urlpatterns = router.urls