from __future__ import annotations

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.viewsets import ModelViewSet, ViewSet

from ai.models import ConversationLog
from ai.orchestrator.orchestrator import Orchestrator
from ai.registry.skill_registry import SkillRegistry
from ai.serializers import (
    ChatRequestSerializer,
    ChatResponseSerializer,
    ConversationListSerializer,
    ConversationLogSerializer,
)
from ai.providers.lm_studio_provider import LMStudioProvider
from ai.memory.database_memory import DatabaseMemory
from ai.skills.inventory_skill import InventorySkill
from ai.skills.employee_skill import EmployeeSkill
from ai.skills.production_skill import ProductionSkill
from ai.skills.purchase_skill import PurchaseSkill
from ai.skills.sales_skill import SalesSkill
from ai.skills.accounting_skill import AccountingSkill
from ai.skills.quality_skill import QualitySkill
from ai.skills.reporting_skill import ReportingSkill


def build_orchestrator() -> Orchestrator:
    registry = SkillRegistry()
    registry.register_many(
        InventorySkill(),
        EmployeeSkill(),
        ProductionSkill(),
        PurchaseSkill(),
        SalesSkill(),
        AccountingSkill(),
        QualitySkill(),
        ReportingSkill(),
    )
    provider_config = settings.AI_LLM_CONFIG.get(settings.AI_LLM_PROVIDER, {})
    provider = LMStudioProvider(config=provider_config)
    memory = DatabaseMemory()
    return Orchestrator(registry=registry, provider=provider, memory=memory)


_orchestrator: Orchestrator | None = None


def get_orchestrator() -> Orchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = build_orchestrator()
    return _orchestrator


class ConversationViewSet(ModelViewSet):
    queryset = ConversationLog.objects.select_related("user").all()
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    http_method_names = ["get", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "list":
            return ConversationListSerializer
        return ConversationLogSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_destroy(self, instance):
        instance.messages.all().delete()
        instance.delete()


class ChatViewSet(ViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]

    def create(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        orb = get_orchestrator()
        result = orb.chat(
            user_message=serializer.validated_data["message"],
            conversation_id=serializer.validated_data.get("conversation_id"),
            user=request.user,
        )
        return Response(
            ChatResponseSerializer(result).data,
            status=status.HTTP_200_OK,
        )
