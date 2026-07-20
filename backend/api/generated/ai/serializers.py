from rest_framework import serializers
from .models import *

class ConversationLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = ConversationLog
        fields = '__all__'
        read_only_fields = ['id', 'conversation_id', 'user', 'messages', 'message_count', 'created_at', 'updated_at']
