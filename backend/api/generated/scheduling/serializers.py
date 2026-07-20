from rest_framework import serializers
from .models import *

class CapacityBookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = CapacityBooking
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LinePlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = LinePlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductionPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductionPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Schedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
