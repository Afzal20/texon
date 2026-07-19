from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"group-companies", views.GroupCompanyViewSet)
router.register(r"companies", views.MultiCompanyViewSet)
router.register(r"location-operations", views.LocationBasedOperationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
