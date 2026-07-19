from django.utils import timezone
from rest_framework import serializers

from buyers.models import Buyer
from core.models import Organization
from merchandising.models import PurchaseOrder

from .models import BuyerCommunication, BuyerProfitability, OrderAmendmentHistory


class BuyerCommunicationSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Organization.objects.filter(is_active=True),
    )
    buyer = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=Buyer.objects.select_related("organization").all(),
    )

    class Meta:
        model = BuyerCommunication
        fields = [
            "id",
            "organization",
            "buyer",
            "communication_type",
            "subject",
            "content",
            "contact_person",
            "communication_date",
            "follow_up_date",
            "status",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def validate_communication_date(self, value):
        if value and value > timezone.now():
            raise serializers.ValidationError("Communication date cannot be in the future.")
        return value


class BuyerProfitabilitySerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)  # FK kept flat, read-only

    class Meta:
        model = BuyerProfitability
        fields = [
            "id",
            "buyer",
            "period_start",
            "period_end",
            "total_revenue",
            "total_cost",
            "profit",
            "profit_margin",
            "created_at",
        ]
        read_only_fields = fields


class OrderAmendmentHistorySerializer(serializers.ModelSerializer):
    purchase_order = serializers.PrimaryKeyRelatedField(  # FK kept flat
        queryset=PurchaseOrder.objects.select_related("organization").all(),
    )

    class Meta:
        model = OrderAmendmentHistory
        fields = [
            "id",
            "purchase_order",
            "amendment_date",
            "previous_value",
            "new_value",
            "reason",
            "amended_by",
            "created_at",
        ]
        read_only_fields = ["id", "amended_by", "created_at"]

    def validate_amendment_date(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Amendment date cannot be in the future.")
        return value
