from __future__ import annotations

from rest_framework import serializers

from ai.models import ConversationLog, MessageLog


class MessageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageLog
        fields = ["id", "role", "content", "tool_call_id", "tool_name", "created_at"]


class ConversationLogSerializer(serializers.ModelSerializer):
    messages = MessageLogSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ConversationLog
        fields = ["conversation_id", "user", "messages", "message_count", "created_at", "updated_at"]
        read_only_fields = ["conversation_id", "user", "created_at", "updated_at"]

    def get_message_count(self, obj) -> int:
        return obj.messages.count()


class ToolCallSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    arguments = serializers.DictField()


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(allow_blank=False, trim_whitespace=True)
    conversation_id = serializers.CharField(required=False, allow_null=True, default=None)


class ChatResponseSerializer(serializers.Serializer):
    conversation_id = serializers.CharField()
    message = serializers.CharField()
    tool_calls = ToolCallSerializer(many=True, required=False)

    def to_representation(self, instance):
        if isinstance(instance, dict):
            data = instance
        else:
            data = instance.__dict__
        result = {
            "conversation_id": data.get("conversation_id"),
            "message": data.get("message").content if hasattr(data.get("message"), "content") else data.get("message", ""),
            "tool_calls": [],
        }
        tool_calls = data.get("tool_calls", [])
        for tc in tool_calls:
            if hasattr(tc, "id"):
                result["tool_calls"].append({"id": tc.id, "name": tc.name, "arguments": tc.arguments})
            elif isinstance(tc, dict):
                result["tool_calls"].append(tc)
        return result


class ConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ConversationLog
        fields = ["conversation_id", "message_count", "last_message", "created_at", "updated_at"]

    def get_message_count(self, obj) -> int:
        return obj.messages.count()

    def get_last_message(self, obj) -> str | None:
        last = obj.messages.order_by("-created_at").first()
        return last.content[:120] if last else None
