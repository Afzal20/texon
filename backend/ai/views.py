from django.db.models import Max
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Conversation
from .serializers import ConversationDetailSerializer, ConversationSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """Chat history — every user sees only their own conversations."""

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]
    filterset_fields: list[str] = []
    search_fields = ["title"]
    ordering_fields = ["updated_at", "created_at"]

    def get_queryset(self):
        return (
            Conversation.objects.filter(user=self.request.user)
            .annotate(
                message_count=Max("messages__id"),
                last_message_at=Max("messages__created_at"),
            )
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
