import graphene
from graphene_django import DjangoObjectType
from .models import PurchaseOrder, Buyer, Style, SampleDevelopment, OrderItem, Season, OrderStageLog, BuyerRating

class BuyerRatingType(DjangoObjectType):
    class Meta:
        model = BuyerRating
        fields = "__all__"

class BuyerType(DjangoObjectType):
    class Meta:
        model = Buyer
        fields = "__all__"

class SeasonType(DjangoObjectType):
    class Meta:
        model = Season
        fields = "__all__"

class StyleType(DjangoObjectType):
    class Meta:
        model = Style
        fields = "__all__"

class SampleDevelopmentType(DjangoObjectType):
    class Meta:
        model = SampleDevelopment
        fields = "__all__"

class OrderItemType(DjangoObjectType):
    class Meta:
        model = OrderItem
        fields = "__all__"

class OrderStageLogType(DjangoObjectType):
    class Meta:
        model = OrderStageLog
        fields = "__all__"

class PurchaseOrderType(DjangoObjectType):
    risk_score = graphene.Float()
    risk_level = graphene.String()

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        
    def resolve_risk_score(self, info):
        # Placeholder for AI Risk Assessment
        return 12.5

    def resolve_risk_level(self, info):
        # Placeholder
        return "Low"

class Query(graphene.ObjectType):
    all_orders = graphene.List(PurchaseOrderType)
    order_by_po_number = graphene.Field(PurchaseOrderType, po_number=graphene.String(required=True))

    def resolve_all_orders(self, info):
        return PurchaseOrder.objects.select_related('style__buyer', 'style__season', 'organization').prefetch_related('items', 'stage_logs', 'style__samples').all()

    def resolve_order_by_po_number(self, info, po_number):
        try:
            return PurchaseOrder.objects.select_related('style__buyer', 'style__season', 'organization').prefetch_related('items', 'stage_logs', 'style__samples').get(po_number=po_number)
        except PurchaseOrder.DoesNotExist:
            return None
