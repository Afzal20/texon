from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'asset-categories', views.AssetCategoryViewSet, basename='asset-categories')
router.register(r'depreciation-schedules', views.DepreciationScheduleViewSet, basename='depreciation-schedules')
router.register(r'fixed-assets', views.FixedAssetViewSet, basename='fixed-assets')

urlpatterns = router.urls