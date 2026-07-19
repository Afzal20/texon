from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("me/", views.MeView.as_view(), name="me"),
    path("update-password/", views.UpdatePasswordView.as_view(), name="update-password"),
    path("forgot-password/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("verify-otp/", views.VerifyOTPView.as_view(), name="verify-otp"),
    path("reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("refresh/", views.RefreshTokenView.as_view(), name="refresh"),
]
