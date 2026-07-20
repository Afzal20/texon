from rest_framework import serializers
from .models import *

class SubcontractOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubcontractOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SubcontractTrackingSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubcontractTracking
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
