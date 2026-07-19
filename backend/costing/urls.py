from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"pre-costings", views.PreCostingViewSet)
router.register(r"cost-sheets", views.CostSheetViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
