from rest_framework import serializers
from buyers.models import Buyer
from merchandising.models import Style
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(queryset=Buyer.objects.all())
    style = serializers.PrimaryKeyRelatedField(queryset=Style.objects.all())

    class Meta:
        model = Order
        fields = [
            "id", "organization", "buyer", "style", "order_number",
            "order_date", "delivery_date", "quantity", "unit_price",
            "total_value", "status", "priority", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        if data.get("order_date") and data.get("delivery_date") and data["order_date"] > data["delivery_date"]:
            raise serializers.ValidationError("Order date cannot be after delivery date.")
        return data
