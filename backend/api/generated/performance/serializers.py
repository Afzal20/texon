from rest_framework import serializers
from .models import *

class PerformanceRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = PerformanceRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
