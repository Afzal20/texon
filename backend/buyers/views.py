from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from .models import Buyer, BuyerPortfolio, BuyerRating
from .serializers import (
    BuyerListSerializer,
    BuyerPortfolioSerializer,
    BuyerRatingSerializer,
    BuyerSerializer,
)


class BuyerViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Buyer.objects.select_related("organization").all()
    serializer_class = BuyerSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    filterset_fields = ["country", "is_active"]
    search_fields = ["name", "code", "country"]

    def get_serializer_class(self):
        if self.action == "list":
            return BuyerListSerializer
        return self.serializer_class

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff members can delete buyers.")
        return super().destroy(request, *args, **kwargs)


class BuyerRatingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BuyerRating.objects.select_related("buyer").all()
    serializer_class = BuyerRatingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["buyer", "rating"]
    search_fields = ["buyer__name"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(buyer__organization__is_active=True)
        return qs


class BuyerPortfolioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BuyerPortfolio.objects.select_related("buyer").all()
    serializer_class = BuyerPortfolioSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["buyer"]
    search_fields = ["buyer__name"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(buyer__organization__is_active=True)
        return qs
