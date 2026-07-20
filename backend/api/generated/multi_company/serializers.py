from rest_framework import serializers
from .models import *

class GroupCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = GroupCompany
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LocationBasedOperationSerializer(serializers.ModelSerializer):

    class Meta:
        model = LocationBasedOperation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class MultiCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = MultiCompany
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
