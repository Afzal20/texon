from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'defect-categories', views.DefectCategoryViewSet, basename='defect-categories')
router.register(r'endline-qc', views.EndLineQCViewSet, basename='endline-qc')
router.register(r'fabric-inspections', views.FabricInspectionViewSet, basename='fabric-inspections')
router.register(r'final-inspections', views.FinalInspectionViewSet, basename='final-inspections')
router.register(r'inline-qc', views.InlineQCViewSet, basename='inline-qc')
router.register(r'rejection-reports', views.RejectionReportViewSet, basename='rejection-reports')

urlpatterns = router.urls