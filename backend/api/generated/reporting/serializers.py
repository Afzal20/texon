from rest_framework import serializers
from .models import *

class DashboardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dashboard
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['id', 'generated_at', 'created_at', 'updated_at']
