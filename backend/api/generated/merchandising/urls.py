from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'buyer-enquiries', views.BuyerEnquiryViewSet, basename='buyer-enquiries')
router.register(r'development-monitoring', views.DevelopmentMonitoringViewSet, basename='development-monitoring')
router.register(r'smv-records', views.SMVRecordViewSet, basename='smv-records')
router.register(r'style-analyses', views.StyleViewSet, basename='style-analyses')
router.register(r'style-analyses', views.StyleAnalysisViewSet, basename='style-analyses')

urlpatterns = router.urls