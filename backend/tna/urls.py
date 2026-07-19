from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"tasks", views.TaskViewSet)
router.register(r"job-orders", views.JobOrderViewSet)
router.register(r"timelines", views.TimelineViewSet)
router.register(r"alarm-notifications", views.AlarmNotificationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
