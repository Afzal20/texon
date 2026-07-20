from rest_framework import serializers
from .models import *

class AccessorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Accessory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FabricSerializer(serializers.ModelSerializer):

    class Meta:
        model = Fabric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class PhysicalInventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = PhysicalInventory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ShadeApprovalSerializer(serializers.ModelSerializer):

    class Meta:
        model = ShadeApproval
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class StockMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class TrimSerializer(serializers.ModelSerializer):

    class Meta:
        model = Trim
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class WarehouseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
