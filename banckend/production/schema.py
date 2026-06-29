import graphene
from graphene_django import DjangoObjectType

from .models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    HeatmapData,
    LineCapacity,
    OEELog,
    ProductionLine,
    ProductionRecord,
    ProductionShift,
    ProductionUnit,
)


class ProductionUnitType(DjangoObjectType):
    class Meta:
        model = ProductionUnit
        fields = "__all__"


class ProductionLineType(DjangoObjectType):
    class Meta:
        model = ProductionLine
        fields = "__all__"


class LineCapacityType(DjangoObjectType):
    class Meta:
        model = LineCapacity
        fields = "__all__"


class ProductionShiftType(DjangoObjectType):
    class Meta:
        model = ProductionShift
        fields = "__all__"


class ProductionRecordType(DjangoObjectType):
    class Meta:
        model = ProductionRecord
        fields = "__all__"


class OEELogType(DjangoObjectType):
    class Meta:
        model = OEELog
        fields = "__all__"


class DowntimeEventType(DjangoObjectType):
    class Meta:
        model = DowntimeEvent
        fields = "__all__"


class DefectLogType(DjangoObjectType):
    class Meta:
        model = DefectLog
        fields = "__all__"


class HeatmapDataType(DjangoObjectType):
    class Meta:
        model = HeatmapData
        fields = "__all__"


class BottleneckAlertType(DjangoObjectType):
    class Meta:
        model = BottleneckAlert
        fields = "__all__"


class Query(graphene.ObjectType):
    all_production_units = graphene.List(ProductionUnitType)
    production_unit = graphene.Field(ProductionUnitType, id=graphene.Int(required=True))

    all_production_lines = graphene.List(ProductionLineType)
    production_line = graphene.Field(ProductionLineType, id=graphene.Int(required=True))

    all_line_capacities = graphene.List(LineCapacityType)
    line_capacity = graphene.Field(LineCapacityType, id=graphene.Int(required=True))

    all_production_shifts = graphene.List(ProductionShiftType)
    production_shift = graphene.Field(ProductionShiftType, id=graphene.Int(required=True))

    all_production_records = graphene.List(ProductionRecordType)
    production_record = graphene.Field(ProductionRecordType, id=graphene.Int(required=True))

    all_oee_logs = graphene.List(OEELogType)
    oee_log = graphene.Field(OEELogType, id=graphene.Int(required=True))

    all_downtime_events = graphene.List(DowntimeEventType)
    downtime_event = graphene.Field(DowntimeEventType, id=graphene.Int(required=True))

    all_defect_logs = graphene.List(DefectLogType)
    defect_log = graphene.Field(DefectLogType, id=graphene.Int(required=True))

    all_heatmap_data = graphene.List(HeatmapDataType)
    heatmap_data = graphene.Field(HeatmapDataType, id=graphene.Int(required=True))

    all_bottleneck_alerts = graphene.List(BottleneckAlertType)
    bottleneck_alert = graphene.Field(BottleneckAlertType, id=graphene.Int(required=True))

    # Resolvers
    def resolve_all_production_units(self, info):
        return ProductionUnit.objects.all()

    def resolve_production_unit(self, info, id):
        try:
            return ProductionUnit.objects.get(pk=id)
        except ProductionUnit.DoesNotExist:
            return None

    def resolve_all_production_lines(self, info):
        return ProductionLine.objects.all()

    def resolve_production_line(self, info, id):
        try:
            return ProductionLine.objects.get(pk=id)
        except ProductionLine.DoesNotExist:
            return None

    def resolve_all_line_capacities(self, info):
        return LineCapacity.objects.all()

    def resolve_line_capacity(self, info, id):
        try:
            return LineCapacity.objects.get(pk=id)
        except LineCapacity.DoesNotExist:
            return None

    def resolve_all_production_shifts(self, info):
        return ProductionShift.objects.all()

    def resolve_production_shift(self, info, id):
        try:
            return ProductionShift.objects.get(pk=id)
        except ProductionShift.DoesNotExist:
            return None

    def resolve_all_production_records(self, info):
        return ProductionRecord.objects.all()

    def resolve_production_record(self, info, id):
        try:
            return ProductionRecord.objects.get(pk=id)
        except ProductionRecord.DoesNotExist:
            return None

    def resolve_all_oee_logs(self, info):
        return OEELog.objects.all()

    def resolve_oee_log(self, info, id):
        try:
            return OEELog.objects.get(pk=id)
        except OEELog.DoesNotExist:
            return None

    def resolve_all_downtime_events(self, info):
        return DowntimeEvent.objects.all()

    def resolve_downtime_event(self, info, id):
        try:
            return DowntimeEvent.objects.get(pk=id)
        except DowntimeEvent.DoesNotExist:
            return None

    def resolve_all_defect_logs(self, info):
        return DefectLog.objects.all()

    def resolve_defect_log(self, info, id):
        try:
            return DefectLog.objects.get(pk=id)
        except DefectLog.DoesNotExist:
            return None

    def resolve_all_heatmap_data(self, info):
        return HeatmapData.objects.all()

    def resolve_heatmap_data(self, info, id):
        try:
            return HeatmapData.objects.get(pk=id)
        except HeatmapData.DoesNotExist:
            return None

    def resolve_all_bottleneck_alerts(self, info):
        return BottleneckAlert.objects.all()

    def resolve_bottleneck_alert(self, info, id):
        try:
            return BottleneckAlert.objects.get(pk=id)
        except BottleneckAlert.DoesNotExist:
            return None
