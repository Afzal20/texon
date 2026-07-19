from __future__ import annotations

import asyncio
import json
from typing import Any

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken

from ai.orchestrator.orchestrator import Orchestrator
from ai.registry.skill_registry import SkillRegistry
from ai.memory.database_memory import DatabaseMemory
from ai.providers.lm_studio_provider import LMStudioProvider
from ai.providers.openai_provider import OpenAIProvider
from ai.providers.deepseek_provider import DeepSeekProvider
from ai.skills.inventory_skill import InventorySkill
from ai.skills.employee_skill import EmployeeSkill
from ai.skills.production_skill import ProductionSkill
from ai.skills.purchase_skill import PurchaseSkill
from ai.skills.sales_skill import SalesSkill
from ai.skills.accounting_skill import AccountingSkill
from ai.skills.quality_skill import QualitySkill
from ai.skills.reporting_skill import ReportingSkill

from authentication.models import User

_PROVIDER_MAP = {
    "lm_studio": LMStudioProvider,
    "openai": OpenAIProvider,
    "deepseek": DeepSeekProvider,
}


def _build_orchestrator() -> Orchestrator:
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
    provider_name = settings.AI_LLM_PROVIDER
    provider_config = settings.AI_LLM_CONFIG.get(provider_name, {})
    provider_cls = _PROVIDER_MAP.get(provider_name, LMStudioProvider)
    provider = provider_cls(config=provider_config)
    memory = DatabaseMemory()
    return Orchestrator(registry=registry, provider=provider, memory=memory)


_orchestrator: Orchestrator | None = None


def get_orchestrator() -> Orchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = _build_orchestrator()
    return _orchestrator


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user: User | None = None
        token = self.scope.get("query_string", b"").decode()
        params = dict(p.split("=") for p in token.split("&") if "=" in p) if token else {}
        raw_token = params.get("token", "")

        if not raw_token:
            await self.close(code=4001)
            return

        try:
            access = AccessToken(raw_token)
            user_id = access["user_id"]
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            self.scope["user"] = self.user
            await self.accept()
        except Exception:
            await self.close(code=4001)

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if not self.user:
            await self.close(code=4001)
            return

        try:
            data = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            await self._send_error("Invalid JSON")
            return

        message = data.get("message", "").strip()
        conversation_id = data.get("conversation_id")

        if not message:
            await self._send_error("Message is required")
            return

        orb = await sync_to_async(get_orchestrator)()
        loop = asyncio.get_running_loop()

        collected_tool_calls: list[dict] = []

        def on_token(token: str):
            asyncio.run_coroutine_threadsafe(
                self._send_raw({"type": "token", "data": {"content": token}}), loop
            )

        def on_tool_call(name: str, arguments: dict):
            collected_tool_calls.append({"id": "", "name": name, "arguments": arguments})
            asyncio.run_coroutine_threadsafe(
                self._send_raw({"type": "tool_call", "data": {"name": name, "arguments": arguments}}), loop
            )

        result = await sync_to_async(orb.chat_stream)(
            user_message=message,
            conversation_id=conversation_id,
            user=self.user,
            on_token=on_token,
            on_tool_call=on_tool_call,
        )

        await self._send_raw({
            "type": "done",
            "data": {
                "conversation_id": result.conversation_id or "",
                "tool_calls": collected_tool_calls,
            },
        })

    async def _send_raw(self, payload: dict):
        await self.send(text_data=json.dumps(payload))

    async def _send_error(self, message: str):
        await self._send_raw({"type": "error", "data": {"message": message}})
