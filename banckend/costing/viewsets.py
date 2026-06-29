from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from skeleton.pagination import ProductionPagination
from skeleton.permissions import IsOrganizationMember

from .models import (
    BOMCategory, SupplierQuote, BillOfMaterials, BOMItem,
    CostRevision, ApprovalWorkflow
)
from .serializers import (
    BOMCategorySerializer, SupplierQuoteSerializer, BillOfMaterialsSerializer,
    BOMItemSerializer, CostRevisionSerializer, ApprovalWorkflowSerializer
)
from .filters import (
    SupplierQuoteFilter, BillOfMaterialsFilter, CostRevisionFilter,
    ApprovalWorkflowFilter
)

class BaseCostingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return self.queryset.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class BOMCategoryViewSet(BaseCostingViewSet):
    queryset = BOMCategory.objects.all()
    serializer_class = BOMCategorySerializer

class SupplierQuoteViewSet(BaseCostingViewSet):
    queryset = SupplierQuote.objects.all()
    serializer_class = SupplierQuoteSerializer
    filterset_class = SupplierQuoteFilter

class BillOfMaterialsViewSet(BaseCostingViewSet):
    queryset = BillOfMaterials.objects.all()
    serializer_class = BillOfMaterialsSerializer
    filterset_class = BillOfMaterialsFilter

    @action(detail=True, methods=['post'])
    def create_revision(self, request, pk=None):
        bom = self.get_object()
        reason = request.data.get('reason', 'Standard Revision')
        
        # In a real scenario, you might clone the BOM and increment the version.
        bom.version += 1
        bom.is_approved = False
        bom.save()
        
        CostRevision.objects.create(
            bill_of_materials=bom,
            revised_by=request.user,
            reason=reason
        )
        return Response({'status': f'BOM revised to version {bom.version}'})

class BOMItemViewSet(viewsets.ModelViewSet):
    queryset = BOMItem.objects.all()
    serializer_class = BOMItemSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination

    def get_queryset(self):
        return self.queryset.filter(bill_of_materials__organization=self.request.user.organization)

class CostRevisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostRevision.objects.all()
    serializer_class = CostRevisionSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = CostRevisionFilter

    def get_queryset(self):
        return self.queryset.filter(bill_of_materials__organization=self.request.user.organization)

class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    queryset = ApprovalWorkflow.objects.all()
    serializer_class = ApprovalWorkflowSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ApprovalWorkflowFilter

    def get_queryset(self):
        return self.queryset.filter(bill_of_materials__organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        approval = self.get_object()
        approval.status = 'approved'
        approval.actioned_at = timezone.now()
        approval.comments = request.data.get('comments', '')
        approval.save()
        
        # Check if all approvals for this BOM are done
        bom = approval.bill_of_materials
        if not bom.approvals.filter(status='pending').exists() and not bom.approvals.filter(status='rejected').exists():
            bom.is_approved = True
            bom.save()
            
        return Response({'status': 'Approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        approval = self.get_object()
        approval.status = 'rejected'
        approval.actioned_at = timezone.now()
        approval.comments = request.data.get('comments', '')
        approval.save()
        
        # Rejecting one step rejects the BOM
        bom = approval.bill_of_materials
        bom.is_approved = False
        bom.save()
        
        return Response({'status': 'Rejected'})
