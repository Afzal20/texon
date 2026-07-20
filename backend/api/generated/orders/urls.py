from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'job-orders', views.JobOrderViewSet, basename='job-orders')
router.register(r'job-orders', views.OrderViewSet, basename='job-orders')
router.register(r'sample-orders', views.SampleOrderViewSet, basename='sample-orders')

urlpatterns = router.urls