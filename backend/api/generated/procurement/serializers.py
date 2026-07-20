from rest_framework import serializers
from .models import *

class PurchaseOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class QuotationAnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuotationAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RawMaterialBookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = RawMaterialBooking
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RawMaterialRequisitionSerializer(serializers.ModelSerializer):

    class Meta:
        model = RawMaterialRequisition
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
