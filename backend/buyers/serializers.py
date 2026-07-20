from rest_framework import serializers

from core.models import Organization
from .models import Buyer, BuyerPortfolio, BuyerRating


class BuyerRatingSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = BuyerRating
        fields = [
            "id",
            "buyer",
            "rating",
            "reviews_count",
            "updated_at",
        ]
        read_only_fields = fields


class BuyerPortfolioSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = BuyerPortfolio
        fields = [
            "id",
            "buyer",
            "active_orders",
            "total_units",
            "total_value",
            "updated_at",
        ]
        read_only_fields = fields


class BuyerSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.filter(is_active=True),
    )
    rating = BuyerRatingSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Buyer
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "country",
            "address",
            "contact_person",
            "email",
            "phone",
            "is_active",
            "created_at",
            "updated_at",
            "rating",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "rating"]

    def validate_organization(self, value):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            pass
        return value

    def validate_code(self, value):
        org_id = None
        if self.instance:
            org_id = self.instance.organization_id
        else:
            org_id = self.initial_data.get("organization")

        if org_id:
            qs = Buyer.objects.filter(organization_id=org_id, code__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A buyer with this code already exists in this organization."
                )
        return value


class BuyerListSerializer(serializers.ModelSerializer):
    rating = BuyerRatingSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Buyer
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "country",
            "is_active",
            "created_at",
            "rating",
        ]
