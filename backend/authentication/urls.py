from django.urls import path, include
from .views import GoogleLogin, GitHubLogin, LoggedInDevicesView, SocialAuthURLView

urlpatterns = [
    # Social Logins
    path('social/url/<str:provider>/', SocialAuthURLView.as_view(), name='social_auth_url'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('github/', GitHubLogin.as_view(), name='github_login'),
    
    # Core Auth (Login, Reset Password, Change Password, Profile)
    path('', include('dj_rest_auth.urls')),
    
    # Registration
    path('registration/', include('dj_rest_auth.registration.urls')),
    
    # Logged In Devices
    path('devices/', LoggedInDevicesView.as_view(), name='logged_in_devices_list'),
    path('devices/<int:token_id>/', LoggedInDevicesView.as_view(), name='logged_in_devices_delete'),
]
