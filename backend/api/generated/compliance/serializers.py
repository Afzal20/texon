from rest_framework import serializers
from .models import *

class ComplianceRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = ComplianceRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RiskAssessmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = RiskAssessment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
