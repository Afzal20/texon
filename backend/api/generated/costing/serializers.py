from rest_framework import serializers
from .models import *

class CostSheetSerializer(serializers.ModelSerializer):

    class Meta:
        model = CostSheet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class PreCostingSerializer(serializers.ModelSerializer):

    class Meta:
        model = PreCosting
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class QuotationAnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuotationAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
