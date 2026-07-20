from rest_framework import serializers
from .models import *

class CuttingRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = CuttingRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FloorRequisitionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FloorRequisition
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class InspectionPackingSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionPacking
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductionLineSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductionLine
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductionOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductionOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SewingRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = SewingRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
