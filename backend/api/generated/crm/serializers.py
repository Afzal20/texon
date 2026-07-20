from rest_framework import serializers
from .models import *

class BuyerCommunicationSerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerCommunication
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class BuyerProfitabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerProfitability
        fields = '__all__'
        read_only_fields = ['id', 'buyer', 'period_start', 'period_end', 'total_revenue', 'total_cost', 'profit', 'profit_margin', 'created_at', 'updated_at']

class OrderAmendmentHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderAmendmentHistory
        fields = '__all__'
        read_only_fields = ['id', 'amended_by', 'created_at', 'updated_at']
