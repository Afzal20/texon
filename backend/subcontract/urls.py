from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"subcontract-orders", views.SubcontractOrderViewSet)
router.register(r"subcontract-tracking", views.SubcontractTrackingViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
