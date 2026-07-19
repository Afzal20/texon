from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"departments", views.DepartmentViewSet, basename="department")
router.register(r"designations", views.DesignationViewSet, basename="designation")
router.register(r"employees", views.EmployeeViewSet, basename="employee")
router.register(r"attendance", views.AttendanceViewSet, basename="attendance")
router.register(r"leaves", views.LeaveViewSet, basename="leave")
router.register(r"overtime", views.OvertimeViewSet, basename="overtime")
router.register(r"salary-sheets", views.SalarySheetViewSet, basename="salary-sheet")
router.register(r"bonuses", views.BonusViewSet, basename="bonus")

urlpatterns = router.urls
