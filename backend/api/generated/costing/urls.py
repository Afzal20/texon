from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'cost-sheets', views.CostSheetViewSet, basename='cost-sheets')
router.register(r'pre-costings', views.PreCostingViewSet, basename='pre-costings')
router.register(r'quotation-analyses', views.QuotationAnalysisViewSet, basename='quotation-analyses')

urlpatterns = router.urls