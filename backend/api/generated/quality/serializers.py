from rest_framework import serializers
from .models import *

class DefectCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = DefectCategory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EndLineQCSerializer(serializers.ModelSerializer):

    class Meta:
        model = EndLineQC
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FabricInspectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FabricInspection
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FinalInspectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FinalInspection
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class InlineQCSerializer(serializers.ModelSerializer):

    class Meta:
        model = InlineQC
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RejectionReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = RejectionReport
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
