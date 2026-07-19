from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"asset-categories", views.AssetCategoryViewSet, basename="asset-category")
router.register(r"fixed-assets", views.FixedAssetViewSet, basename="fixed-asset")
router.register(r"depreciation-schedules", views.DepreciationScheduleViewSet, basename="depreciation-schedule")

urlpatterns = router.urls
