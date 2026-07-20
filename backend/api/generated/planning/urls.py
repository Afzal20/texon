from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'line-plans', views.PlanViewSet, basename='line-plans')
router.register(r'tasks', views.TaskViewSet, basename='tasks')

urlpatterns = router.urls