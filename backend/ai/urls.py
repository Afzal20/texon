from __future__ import annotations

from django.urls import path
from rest_framework.routers import DefaultRouter

from ai.views import ChatViewSet, ConversationViewSet

router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")

urlpatterns = [
    path("chat/", ChatViewSet.as_view({"post": "create"}), name="chat"),
] + router.urls
