from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.utils import timezone


from allauth.socialaccount.models import SocialApp
from rest_framework.permissions import AllowAny
import uuid
from .models import SocialAuthCallbackUrl

class LoggedInDevicesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get tokens that belong to the user, are not expired, and are not blacklisted
        tokens = OutstandingToken.objects.filter(
            user=request.user,
            expires_at__gt=timezone.now()
        ).exclude(
            blacklistedtoken__isnull=False
        ).order_by('-created_at')

        data = [
            {
                "id": token.id,
                "created_at": token.created_at,
                "expires_at": token.expires_at,
                "jti": token.jti
            }
            for token in tokens
        ]
        return Response(data)

    def delete(self, request, token_id):
        try:
            token = OutstandingToken.objects.get(
                id=token_id, 
                user=request.user
            )
            BlacklistedToken.objects.get_or_create(token=token)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except OutstandingToken.DoesNotExist:
            return Response({"detail": "Device/Token not found."}, status=status.HTTP_404_NOT_FOUND)


class SocialAuthURLView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider):
        callback_url = request.GET.get("callback_url")
        
        if provider == "google":
            adapter_class = GoogleOAuth2Adapter
        elif provider == "github":
            adapter_class = GitHubOAuth2Adapter
        else:
            return Response({"error": "Unsupported provider"}, status=status.HTTP_400_BAD_REQUEST)
            
        adapter = adapter_class(request)
        provider_obj = adapter.get_provider()
        app = provider_obj.app
        
        if not app:
            return Response({"error": f"SocialApp for {provider} not configured in admin"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not callback_url:
            db_callback = SocialAuthCallbackUrl.objects.filter(provider=provider).first()
            callback_url = db_callback.callback_url if db_callback else f"http://localhost:3000/auth/{provider}/callback"
            
        scope = provider_obj.get_scope_from_request(request)
        auth_params = provider_obj.get_auth_params_from_request(request, "authenticate")
        
        client = OAuth2Client(
            request, 
            app.client_id, 
            app.secret, 
            adapter.access_token_method, 
            adapter.access_token_url, 
            callback_url, 
            scope
        )
        
        # State parameter is required by some providers and helps prevent CSRF
        client.state = str(uuid.uuid4())
        
        try:
            url = client.get_redirect_url(adapter.authorize_url, auth_params)
            return Response({"authorization_url": url})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client

    @property
    def callback_url(self):
        # 1. Check if provided by frontend in the POST request
        if hasattr(self, "request") and self.request and "callback_url" in self.request.data:
            return self.request.data["callback_url"]
        
        # 2. Fallback to database configuration
        obj = SocialAuthCallbackUrl.objects.filter(provider="google").first()
        return obj.callback_url if obj else "http://localhost:3000/auth/google/callback"

class GitHubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    
    @property
    def callback_url(self):
        # 1. Check if provided by frontend in the POST request
        if hasattr(self, "request") and self.request and "callback_url" in self.request.data:
            return self.request.data["callback_url"]
            
        # 2. Fallback to database configuration
        obj = SocialAuthCallbackUrl.objects.filter(provider="github").first()
        return obj.callback_url if obj else "http://localhost:3000/auth/github/callback"
