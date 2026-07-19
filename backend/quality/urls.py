from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"defect-categories", views.DefectCategoryViewSet, basename="defect-category")
router.register(r"fabric-inspections", views.FabricInspectionViewSet, basename="fabric-inspection")
router.register(r"inline-qc", views.InlineQCViewSet, basename="inline-qc")
router.register(r"endline-qc", views.EndLineQCViewSet, basename="endline-qc")
router.register(r"rejection-reports", views.RejectionReportViewSet, basename="rejection-report")
router.register(r"final-inspections", views.FinalInspectionViewSet, basename="final-inspection")

urlpatterns = router.urls
