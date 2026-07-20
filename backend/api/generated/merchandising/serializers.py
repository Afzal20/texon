from rest_framework import serializers
from .models import *

class BuyerEnquirySerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerEnquiry
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DevelopmentMonitoringSerializer(serializers.ModelSerializer):

    class Meta:
        model = DevelopmentMonitoring
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SMVRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = SMVRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class StyleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Style
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class StyleAnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model = StyleAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
