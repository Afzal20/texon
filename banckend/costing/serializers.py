from rest_framework import serializers
from .models import (
    BOMCategory, SupplierQuote, BillOfMaterials, BOMItem,
    CostRevision, ApprovalWorkflow
)

class BOMCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BOMCategory
        fields = ['id', 'organization', 'name', 'description']
        read_only_fields = ['id', 'organization']

class SupplierQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierQuote
        fields = [
            'id', 'organization', 'supplier_name', 'item_description',
            'unit_price', 'currency', 'valid_until'
        ]
        read_only_fields = ['id', 'organization']

class BOMItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=4, read_only=True)

    class Meta:
        model = BOMItem
        fields = [
            'id', 'bill_of_materials', 'category', 'category_name',
            'description', 'required_qty', 'unit_price', 'wastage_percentage',
            'total_cost'
        ]
        read_only_fields = ['id']

class BillOfMaterialsSerializer(serializers.ModelSerializer):
    items = BOMItemSerializer(many=True, read_only=True)
    total_bom_cost = serializers.SerializerMethodField()

    class Meta:
        model = BillOfMaterials
        fields = [
            'id', 'organization', 'purchase_order', 'style_code',
            'version', 'is_approved', 'created_at', 'items', 'total_bom_cost'
        ]
        read_only_fields = ['id', 'organization', 'created_at']

    def get_total_bom_cost(self, obj):
        return sum(item.total_cost for item in obj.items.all())

class CostRevisionSerializer(serializers.ModelSerializer):
    revised_by_email = serializers.CharField(source='revised_by.email', read_only=True)

    class Meta:
        model = CostRevision
        fields = [
            'id', 'bill_of_materials', 'revised_by', 'revised_by_email',
            'revision_date', 'reason'
        ]
        read_only_fields = ['id', 'revised_by', 'revision_date']

class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    approver_email = serializers.CharField(source='approver.email', read_only=True)

    class Meta:
        model = ApprovalWorkflow
        fields = [
            'id', 'bill_of_materials', 'approver', 'approver_email',
            'status', 'comments', 'actioned_at'
        ]
        read_only_fields = ['id', 'actioned_at']
