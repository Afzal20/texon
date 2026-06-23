from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .views import UserRegisterView, ChangePasswordView, CustomTokenObtainPairView

from django.urls import path

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # refresh token
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'), # verify token
    path('register/', UserRegisterView.as_view(), name='register'), # register user
    path('change-password/', ChangePasswordView.as_view(), name='change_password'), # change password
]