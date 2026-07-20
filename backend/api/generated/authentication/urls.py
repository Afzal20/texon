from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'me', views.UserViewSet, basename='auth/me')
router.register(r'verify-otps', views.VerifyOTPViewSet, basename='verify-otps')

urlpatterns = router.urls