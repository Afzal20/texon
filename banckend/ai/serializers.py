"""Request and response serializers for the AI HTTP API."""

from rest_framework import serializers

# ── Safety constants ──────────────────────────────────────────────
MAX_MESSAGE_LENGTH = 4000
MAX_HISTORY_LENGTH = 50
MAX_HISTORY_CONTENT_LENGTH = 8000
ALLOWED_HISTORY_ROLES = frozenset({'user', 'assistant', 'tool', 'system'})


class AIChatRequestSerializer(serializers.Serializer):
    """Payload accepted by the AI chat endpoint."""

    message = serializers.CharField(
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH,
        help_text='The user message to send to the assistant.',
    )
    history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
        max_length=MAX_HISTORY_LENGTH,
        help_text='Optional previous messages, each containing at least "role" and optionally "content".',
    )
    title = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        help_text='Optional conversation title.',
    )
    conversation_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text='Optional existing conversation ID to continue.',
    )

    def validate_history(self, history: list) -> list:
        """Validate, sanitize, and cap individual history messages."""

        cleaned: list = []
        for index, item in enumerate(history):
            if not item:
                continue

            role = item.get('role')
            if not isinstance(role, str) or not role.strip():
                raise serializers.ValidationError(
                    {index: {'role': 'This field is required and must be a non-empty string.'}},
                )

            role = role.strip().lower()
            if role not in ALLOWED_HISTORY_ROLES:
                raise serializers.ValidationError(
                    {index: {'role': f'Invalid role "{role}". Allowed: {", ".join(sorted(ALLOWED_HISTORY_ROLES))}.'}},
                )

            content = item.get('content', '')
            if isinstance(content, str) and len(content) > MAX_HISTORY_CONTENT_LENGTH:
                raise serializers.ValidationError(
                    {index: {'content': f'Content exceeds maximum length of {MAX_HISTORY_CONTENT_LENGTH} characters.'}},
                )

            cleaned.append({**item, 'role': role})

        return cleaned


class AIToolCallSerializer(serializers.Serializer):
    """One approved tool action requested by the assistant."""

    name = serializers.CharField()
    arguments = serializers.DictField()
    call_id = serializers.CharField(allow_null=True)


class AIChatResponseSerializer(serializers.Serializer):
    """Successful AI chat response."""

    conversation_id = serializers.IntegerField()
    content = serializers.CharField()
    tool_calls = AIToolCallSerializer(many=True)
    metadata = serializers.DictField()
