from rest_framework import serializers
from .models import *

class BillOfExchangeSerializer(serializers.ModelSerializer):

    class Meta:
        model = BillOfExchange
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LCSerializer(serializers.ModelSerializer):

    class Meta:
        model = LC
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ShipmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
