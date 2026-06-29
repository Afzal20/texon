from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    BOMCategoryViewSet, SupplierQuoteViewSet, BillOfMaterialsViewSet,
    BOMItemViewSet, CostRevisionViewSet, ApprovalWorkflowViewSet
)

router = DefaultRouter()
router.register(r'bom-categories', BOMCategoryViewSet, basename='bom-category')
router.register(r'supplier-quotes', SupplierQuoteViewSet, basename='supplier-quote')
router.register(r'boms', BillOfMaterialsViewSet, basename='bom')
router.register(r'bom-items', BOMItemViewSet, basename='bom-item')
router.register(r'revisions', CostRevisionViewSet, basename='cost-revision')
router.register(r'approvals', ApprovalWorkflowViewSet, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
]
