from django.urls import path
from .views import GoogleLogin, GitHubLogin

urlpatterns = [
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('github/', GitHubLogin.as_view(), name='github_login'),
]
