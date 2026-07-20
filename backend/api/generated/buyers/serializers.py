from rest_framework import serializers
from .models import *

class BuyerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Buyer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'rating']

class BuyerPortfolioSerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerPortfolio
        fields = '__all__'
        read_only_fields = ['id', 'buyer', 'active_orders', 'total_units', 'total_value', 'updated_at', 'created_at']

class BuyerRatingSerializer(serializers.ModelSerializer):

    class Meta:
        model = BuyerRating
        fields = '__all__'
        read_only_fields = ['id', 'buyer', 'rating', 'reviews_count', 'updated_at', 'created_at']
