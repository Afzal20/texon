from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from skeleton.pagination import ProductionPagination
from skeleton.permissions import IsOrganizationMember

from .models import (
    Warehouse, WarehouseZone, InventoryItem, FabricRoll,
    StockTransaction, StockLevel, Requisition,
    DeadstockAlert, ReorderPrediction
)
from .serializers import (
    WarehouseSerializer, WarehouseZoneSerializer, InventoryItemSerializer,
    FabricRollSerializer, StockTransactionSerializer, StockLevelSerializer,
    RequisitionSerializer, DeadstockAlertSerializer, ReorderPredictionSerializer
)
from .filters import (
    WarehouseFilter, WarehouseZoneFilter, InventoryItemFilter,
    FabricRollFilter, StockTransactionFilter, StockLevelFilter,
    RequisitionFilter
)

from rest_framework import serializers

class BaseInventoryViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that automatically filters by the user's organization
    and assigns the organization on creation.
    """
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class WarehouseViewSet(BaseInventoryViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    filterset_class = WarehouseFilter

class WarehouseZoneViewSet(viewsets.ModelViewSet):
    # Zones don't have direct org FK, so we filter through warehouse
    queryset = WarehouseZone.objects.all()
    serializer_class = WarehouseZoneSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = WarehouseZoneFilter

    def get_queryset(self):
        return self.queryset.filter(warehouse__organization=self.request.user.organization)

class InventoryItemViewSet(BaseInventoryViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    filterset_class = InventoryItemFilter

class FabricRollViewSet(BaseInventoryViewSet):
    queryset = FabricRoll.objects.all()
    serializer_class = FabricRollSerializer
    filterset_class = FabricRollFilter

class StockTransactionViewSet(BaseInventoryViewSet):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    filterset_class = StockTransactionFilter

    def perform_create(self, serializer):
        with transaction.atomic():
            # Save the transaction
            instance = serializer.save(
                organization=self.request.user.organization,
                performed_by=self.request.user
            )

            # Update StockLevels
            qty = instance.quantity
            item = instance.inventory_item

            if instance.transaction_type == 'receive':
                if not instance.to_zone:
                    raise serializers.ValidationError("to_zone is required for receive transactions")
                stock, _ = StockLevel.objects.get_or_create(
                    warehouse_zone=instance.to_zone,
                    inventory_item=item
                )
                stock.current_stock += qty
                stock.save()

            elif instance.transaction_type == 'issue':
                if not instance.from_zone:
                    raise serializers.ValidationError("from_zone is required for issue transactions")
                stock = StockLevel.objects.get(
                    warehouse_zone=instance.from_zone,
                    inventory_item=item
                )
                if stock.current_stock < qty:
                    raise serializers.ValidationError("Insufficient stock")
                stock.current_stock -= qty
                stock.save()

            elif instance.transaction_type == 'transfer':
                if not instance.from_zone or not instance.to_zone:
                    raise serializers.ValidationError("from_zone and to_zone are required for transfers")
                # Deduct from source
                from_stock = StockLevel.objects.get(
                    warehouse_zone=instance.from_zone,
                    inventory_item=item
                )
                if from_stock.current_stock < qty:
                    raise serializers.ValidationError("Insufficient stock in source zone")
                from_stock.current_stock -= qty
                from_stock.save()
                
                # Add to destination
                to_stock, _ = StockLevel.objects.get_or_create(
                    warehouse_zone=instance.to_zone,
                    inventory_item=item
                )
                to_stock.current_stock += qty
                to_stock.save()

class StockLevelViewSet(viewsets.ReadOnlyModelViewSet):
    # StockLevels are read-only and don't have direct org FK
    queryset = StockLevel.objects.all()
    serializer_class = StockLevelSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = StockLevelFilter

    def get_queryset(self):
        return self.queryset.filter(warehouse_zone__warehouse__organization=self.request.user.organization)

class RequisitionViewSet(BaseInventoryViewSet):
    queryset = Requisition.objects.all()
    serializer_class = RequisitionSerializer
    filterset_class = RequisitionFilter

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            requested_by=self.request.user
        )

class DeadstockAlertViewSet(BaseInventoryViewSet):
    queryset = DeadstockAlert.objects.all()
    serializer_class = DeadstockAlertSerializer

class ReorderPredictionViewSet(BaseInventoryViewSet):
    queryset = ReorderPrediction.objects.all()
    serializer_class = ReorderPredictionSerializer
