from urllib.parse import urlparse

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from django.utils import timezone


from allauth.socialaccount.models import SocialApp
from rest_framework.permissions import AllowAny
import uuid
from .models import SocialAuthCallbackUrl


# ── OAuth callback_url allowlisting (open-redirect defence) ──────────────────
# The frontend may request a specific callback_url, but it is NEVER trusted
# blindly: the URL must match the SOCIAL_CALLBACK_ALLOWLIST (host:port entries
# from settings/env). https is enforced everywhere except localhost dev.
LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1", "[::1]"}


def _validate_callback_url(callback_url):
    """Return ``callback_url`` when it points at an allowlisted host, else None."""
    if not callback_url or not isinstance(callback_url, str):
        return None
    try:
        parsed = urlparse(callback_url)
    except ValueError:
        return None
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None
    # Reject embedded credentials (https://user:pass@evil.com style tricks).
    if parsed.username or parsed.password:
        return None
    allowlist = {
        entry.strip().lower()
        for entry in getattr(settings, "SOCIAL_CALLBACK_ALLOWLIST", [])
        if entry.strip()
    }
    if parsed.netloc.lower() not in allowlist:
        return None
    host = (parsed.hostname or "").lower()
    if parsed.scheme == "http" and host not in LOCAL_HOSTS:
        # Plain http is only acceptable for local development callbacks.
        return None
    return callback_url


def _fallback_callback_url(provider):
    """Admin-configured callback URL (validated), else the local dev default."""
    db_callback = SocialAuthCallbackUrl.objects.filter(provider=provider).first()
    candidate = db_callback.callback_url if db_callback else f"http://localhost:3000/auth/{provider}/callback"
    return _validate_callback_url(candidate) or f"http://localhost:3000/auth/{provider}/callback"

# ── Brute-force defence on the JWT login endpoint ────────────────────────────
# Scoped throttle (see "auth_login" in settings.DEFAULT_THROTTLE_RATES) keeps
# credential-stuffing attempts per IP/credentials bounded.
class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"


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

        # Only allowlisted callback URLs are accepted; anything else falls back
        # to the admin-configured (or local dev) URL. Prevents open redirects
        # and OAuth authorization-code interception.
        callback_url = (
            _validate_callback_url(request.GET.get("callback_url"))
            or _fallback_callback_url(provider)
        )
            
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
        # 1. Frontend-provided callback_url — accepted only when allowlisted.
        requested = None
        if hasattr(self, "request") and self.request:
            requested = self.request.data.get("callback_url")
        return _validate_callback_url(requested) or _fallback_callback_url("google")

class GitHubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    
    @property
    def callback_url(self):
        # 1. Frontend-provided callback_url — accepted only when allowlisted.
        requested = None
        if hasattr(self, "request") and self.request:
            requested = self.request.data.get("callback_url")
        return _validate_callback_url(requested) or _fallback_callback_url("github")
