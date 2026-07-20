from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'alarm-notifications', views.AlarmNotificationViewSet, basename='alarm-notifications')
router.register(r'job-orders', views.JobOrderViewSet, basename='job-orders')
router.register(r'tasks', views.TaskViewSet, basename='tasks')
router.register(r'timelines', views.TimelineViewSet, basename='timelines')

urlpatterns = router.urls