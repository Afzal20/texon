from rest_framework import serializers
from .models import *

class JobOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SampleOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = SampleOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
