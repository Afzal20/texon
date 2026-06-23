# views.py

from rest_framework.generics import CreateAPIView, GenericAPIView
from .serializers import RegisterSerializer, ChangePasswordSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response


class UserRegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ChangePasswordView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

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