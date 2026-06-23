# views.py

from rest_framework.generics import CreateAPIView, GenericAPIView
from .serializers import RegisterSerializer, ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordOTPSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
import random, requests
from django.core.cache import caches
from django.core.mail import send_mail
from user_agents import parse
from .models import CustomUser


class UserRegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'auth'


class ChangePasswordView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    throttle_scope = 'auth'

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user

        # if not user.check_password(serializer.validated_data["old_password"]):
        #     return Response({"old_password": ["Wrong password."]}, status=400)

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"success": True})


import requests
from user_agents import parse
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserSession

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_scope = 'auth'

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # If login was successful, track session
        if response.status_code == 200:
            user = None
            serializer = self.get_serializer(data=request.data)
            try:
                serializer.is_valid(raise_exception=True)
                user = serializer.user
            except Exception:
                pass
            
            if user:
                ip_address = get_client_ip(request)
                user_agent_string = request.META.get('HTTP_USER_AGENT', '')
                user_agent = parse(user_agent_string)
                
                # Format e.g., "Windows - Chrome"
                os_family = user_agent.os.family
                if 'Windows' in os_family:
                    os_family = 'Windows PC'
                device = f"{os_family} - {user_agent.browser.family}"
                location = "Unknown"
                
                if ip_address and ip_address != "127.0.0.1":
                    try:
                        # Short timeout to prevent blocking the login process
                        geo_response = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=2)
                        if geo_response.status_code == 200:
                            data = geo_response.json()
                            if data.get("status") == "success":
                                city = data.get("city", "")
                                country = data.get("country", "")
                                location = f"{city}, {country}".strip(", ")
                    except requests.exceptions.RequestException:
                        pass
                elif ip_address == "127.0.0.1":
                    location = "Localhost"
                
                UserSession.objects.create(
                    user=user,
                    ip_address=ip_address,
                    device=device,
                    location=location
                )
        
        return response


class ForgotPasswordView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer
    throttle_scope = 'auth'

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        if CustomUser.objects.filter(email=email).exists():
            otp = str(random.randint(100000, 999999))
            
            # Store in 'otp' cache for 5 minutes
            otp_cache = caches['otp']
            otp_cache.set(f"password_reset_otp_{email}", otp, timeout=300)
            
            # Send email
            send_mail(
                "Password Reset OTP",
                f"Your OTP for password reset is: {otp}. It is valid for 5 minutes.",
                "noreply@example.com", # Change to your preferred from-email
                [email],
                fail_silently=False,
            )
            return Response({"success": "If an account with that email exists, an OTP has been sent."}, status=200)

        # Still return success to prevent email enumeration
        return Response({"success": "If an account with that email exists, an OTP has been sent."}, status=200)


class ResetPasswordOTPView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordOTPSerializer
    throttle_scope = 'auth'

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        otp_cache = caches['otp']
        cached_otp = otp_cache.get(f"password_reset_otp_{email}")

        if cached_otp and cached_otp == otp:
            try:
                user = CustomUser.objects.get(email=email)
                user.set_password(new_password)
                user.save()
                
                # Delete OTP from cache after successful use
                otp_cache.delete(f"password_reset_otp_{email}")
                
                return Response({"success": "Password has been reset successfully."}, status=200)
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found."}, status=404)
        
        return Response({"error": "Invalid or expired OTP."}, status=400)


from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import Group
from .serializers import UserProfileSerializer, GroupSerializer

class UserProfileView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        if request.user.is_staff or request.user.is_superuser:
            raise PermissionDenied("Admin information is not shared via the API. Please use the Admin panel.")
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=200)


class GroupAccessView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer

    def get(self, request):
        if request.user.is_staff or request.user.is_superuser:
            raise PermissionDenied("Admin information is not shared via the API. Please use the Admin panel.")
        # Return only the groups the current user belongs to
        groups = request.user.groups.all()
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data, status=200)