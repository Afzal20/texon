from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'group-companies', views.GroupCompanyViewSet, basename='group-companies')
router.register(r'location-operations', views.LocationBasedOperationViewSet, basename='location-operations')
router.register(r'companies', views.MultiCompanyViewSet, basename='companies')

urlpatterns = router.urls