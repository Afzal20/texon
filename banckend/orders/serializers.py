from rest_framework import serializers
from .models import (
    Buyer, Season, Style, PurchaseOrder, OrderItem,
    OrderStageLog, SampleDevelopment, BuyerRating
)

class BuyerRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerRating
        fields = ['id', 'rating', 'reviews_count']
        read_only_fields = ['id']

class BuyerSerializer(serializers.ModelSerializer):
    rating = BuyerRatingSerializer(read_only=True)

    class Meta:
        model = Buyer
        fields = ['id', 'organization', 'name', 'code', 'country', 'created_at', 'rating']
        read_only_fields = ['id', 'created_at']

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = ['id', 'organization', 'name', 'year']
        read_only_fields = ['id']

class StyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Style
        fields = ['id', 'organization', 'buyer', 'season', 'code', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'color', 'size', 'qty']
        read_only_fields = ['id']

class OrderStageLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = OrderStageLog
        fields = ['id', 'stage', 'changed_by', 'changed_by_name', 'changed_at', 'notes']
        read_only_fields = ['id', 'changed_at']

class SampleDevelopmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SampleDevelopment
        fields = ['id', 'style', 'sample_type', 'status', 'submission_date', 'comments']
        read_only_fields = ['id']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'organization', 'po_number', 'style', 'qty', 'ship_date', 'current_stage', 'created_at', 'items']
        read_only_fields = ['id', 'created_at']
