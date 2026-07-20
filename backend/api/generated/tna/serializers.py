from rest_framework import serializers
from .models import *

class AlarmNotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = AlarmNotification
        fields = '__all__'
        read_only_fields = ['id', 'sent_at', 'created_at', 'updated_at']

class JobOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class TimelineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Timeline
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
