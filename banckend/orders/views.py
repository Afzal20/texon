from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q

from .models import (
    Buyer, PurchaseOrder, OrderStageLog, Style
)
from .serializers import (
    BuyerSerializer, PurchaseOrderSerializer, OrderStageLogSerializer
)

from .permissions import IsOrganizationMember

class BuyerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    @action(detail=True, methods=['get'])
    def portfolio(self, request, pk=None):
        buyer = self.get_object()
        # Active orders summary for the specific buyer
        active_orders = PurchaseOrder.objects.filter(
            style__buyer=buyer
        ).exclude(current_stage='shipping')
        
        # We could aggregate this data, for now we just return the count and some basic info
        data = {
            'buyer': buyer.name,
            'active_orders_count': active_orders.count(),
            'active_po_numbers': list(active_orders.values_list('po_number', flat=True))
        }
        return Response(data)

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    lookup_field = 'po_number'

    @action(detail=False, methods=['get'])
    def active(self, request):
        # Active pipeline
        active_orders = self.get_queryset().exclude(current_stage='shipping')
        serializer = self.get_serializer(active_orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def stage(self, request, po_number=None):
        # Update stage
        po = self.get_object()
        new_stage = request.data.get('stage')
        notes = request.data.get('notes', '')
        
        if not new_stage:
            return Response({"error": "Stage is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_stages = dict(PurchaseOrder.STAGE_CHOICES).keys()
        if new_stage not in valid_stages:
            return Response({"error": f"Invalid stage. Choices are: {', '.join(valid_stages)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        po.current_stage = new_stage
        po.save()
        
        # Log the stage change
        log_entry = OrderStageLog.objects.create(
            purchase_order=po,
            stage=new_stage,
            changed_by=request.user if request.user.is_authenticated else None,
            notes=notes
        )
        
        return Response({
            "message": "Stage updated successfully",
            "current_stage": po.current_stage,
            "log_id": log_entry.id
        })

    @action(detail=True, methods=['post'], url_path='risk-assessment')
    def risk_assessment(self, request, po_number=None):
        po = self.get_object()
        # Placeholder for AI Risk Assessment logic
        data = {
            "po_number": po.po_number,
            "risk_score": 12.5,  # Dummy data
            "risk_level": "Low",
            "factors": [
                "Supplier historical delay probability: 5%",
                "Fabric sourcing lead time variance: 2 days"
            ]
        }
        return Response(data)

    @action(detail=True, methods=['get'])
    def timeline(self, request, po_number=None):
        po = self.get_object()
        logs = po.stage_logs.all().order_by('changed_at')
        serializer = OrderStageLogSerializer(logs, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)
