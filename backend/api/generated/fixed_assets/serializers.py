from rest_framework import serializers
from .models import *

class AssetCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = AssetCategory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DepreciationScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = DepreciationSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FixedAssetSerializer(serializers.ModelSerializer):

    class Meta:
        model = FixedAsset
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
