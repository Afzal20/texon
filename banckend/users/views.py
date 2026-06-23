# views.py

from rest_framework.generics import CreateAPIView
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response


class UserRegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if not user.check_password(request.data["old_password"]):
            return Response({"error": "Wrong password"}, status=400)

        user.set_password(request.data["new_password"])
        user.save()

        return Response({"success": True})