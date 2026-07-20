from datetime import date

from django.db import models
from django.db.models import Avg, Count, Sum
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsPagination
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("organization", "buyer", "style").all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority"]
    search_fields = ["order_number", "notes"]
    ordering_fields = ["order_date", "delivery_date", "created_at", "total_value"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(organization__is_active=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete records.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="dashboard-summary")
    def dashboard_summary(self, request):
        today = date.today()
        start_of_year = today.replace(month=1, day=1)

        qs = Order.objects.all()
        if not request.user.is_staff:
            qs = qs.filter(organization__is_active=True)

        ytd_orders = qs.filter(order_date__gte=start_of_year)
        total_ytd = ytd_orders.aggregate(s=Sum("total_value"))["s"] or 0

        active_buyers = (
            ytd_orders.values("buyer").distinct().count()
        )

        from datetime import timedelta

        lead_data = qs.exclude(
            Q(order_date__isnull=True) | Q(delivery_date__isnull=True)
        ).values_list("order_date", "delivery_date")

        total_days = 0
        count = 0
        for o_date, d_date in lead_data:
            total_days += (d_date - o_date).days
            count += 1

        avg_lead_days = round(total_days / count, 1) if count else 0

        samples_pending = qs.filter(status="pending").count()

        return Response({
            "total_ytd": str(total_ytd),
            "active_buyers": active_buyers,
            "avg_lead_time_days": avg_lead_days,
            "samples_pending": samples_pending,
        })
