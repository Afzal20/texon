from django.contrib.auth import logout
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UpdatePasswordSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from .utils import create_and_send_otp


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.none()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [AnonRateThrottle]

    @extend_schema(
        responses={
            201: OpenApiResponse(
                description="User registered successfully",
                examples=[
                    OpenApiExample(
                        "Success",
                        value={
                            "user": {
                                "id": 1,
                                "email": "user@example.com",
                                "first_name": "",
                                "last_name": "",
                                "phone": "",
                                "is_verified": False,
                                "date_joined": "2026-07-19T12:00:00Z",
                            },
                            "access": "eyJ...",
                            "refresh": "eyJ...",
                        },
                    )
                ],
            )
        },
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        roles = list(user.user_roles.values_list("role__name", flat=True))
        perms = sorted(get_user_permissions(user))
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "permissions": perms,
                "roles": roles,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer
    throttle_classes = [AnonRateThrottle]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(
                description="Login successful",
                examples=[
                    OpenApiExample(
                        "Success",
                        value={
                            "user": {
                                "id": 1,
                                "email": "user@example.com",
                                "first_name": "",
                                "last_name": "",
                                "phone": "",
                                "is_verified": True,
                                "date_joined": "2026-07-19T12:00:00Z",
                            },
                            "access": "eyJ...",
                            "refresh": "eyJ...",
                        },
                    )
                ],
            )
        },
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        roles = list(user.user_roles.values_list("role__name", flat=True))
        perms = sorted(get_user_permissions(user))
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "permissions": perms,
                "roles": roles,
            }
        )


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = None
    throttle_classes = [UserRateThrottle]

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "refresh": {"type": "string", "description": "Refresh token to blacklist"}
                },
            }
        },
        responses={200: OpenApiResponse(description="Logged out successfully")},
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        logout(request)
        return Response({"detail": "Logged out successfully."})


from rbac.permissions import get_user_permissions


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [UserRateThrottle]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        perms = get_user_permissions(instance)
        roles = list(instance.user_roles.values_list("role__name", flat=True))
        data = serializer.data
        data["permissions"] = sorted(perms)
        data["roles"] = roles
        return Response(data)


class UpdatePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UpdatePasswordSerializer
    throttle_classes = [UserRateThrottle]

    def post(self, request):
        serializer = UpdatePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password updated successfully."})


class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ForgotPasswordSerializer
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email=email)
        create_and_send_otp(user, purpose="password_reset")
        return Response({"detail": "OTP sent to your email."})


class VerifyOTPView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = VerifyOTPSerializer
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data["otp"]
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        refresh = RefreshToken.for_user(serializer.validated_data["user"])
        return Response(
            {
                "detail": "OTP verified.",
                "reset_token": str(refresh.access_token),
            }
        )


class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResetPasswordSerializer
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        otp = serializer.validated_data["otp"]
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        return Response({"detail": "Password has been reset successfully."})


class RefreshTokenView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = None
    throttle_classes = [AnonRateThrottle]

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "refresh": {"type": "string", "description": "Valid refresh token"}
                },
                "required": ["refresh"],
            }
        },
        responses={
            200: OpenApiResponse(
                description="New access token",
                examples=[OpenApiExample("Success", value={"access": "eyJ..."})],
            )
        },
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            return Response({"access": str(token.access_token)})
        except Exception:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
