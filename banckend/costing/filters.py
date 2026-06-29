import django_filters
from .models import (
    SupplierQuote, BillOfMaterials, CostRevision, ApprovalWorkflow
)

class SupplierQuoteFilter(django_filters.FilterSet):
    supplier_name = django_filters.CharFilter(lookup_expr='icontains')
    item_description = django_filters.CharFilter(lookup_expr='icontains')
    valid_until_after = django_filters.DateFilter(field_name='valid_until', lookup_expr='gte')

    class Meta:
        model = SupplierQuote
        fields = ['supplier_name', 'item_description', 'currency']

class BillOfMaterialsFilter(django_filters.FilterSet):
    style_code = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = BillOfMaterials
        fields = ['purchase_order', 'style_code', 'is_approved']

class CostRevisionFilter(django_filters.FilterSet):
    class Meta:
        model = CostRevision
        fields = ['bill_of_materials', 'revised_by']

class ApprovalWorkflowFilter(django_filters.FilterSet):
    class Meta:
        model = ApprovalWorkflow
        fields = ['bill_of_materials', 'approver', 'status']
