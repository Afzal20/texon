"""
Production app GraphQL schema — implements the contract documented in
frontend_graphql_guide.md:

    allProductionUnits / productionUnit
    allProductionLines / productionLine
    allLineCapacities / lineCapacity
    allProductionShifts / productionShift
    allProductionRecords / productionRecord
    allOeeLogs / oeeLog
    allDowntimeEvents / downtimeEvent
    allDefectLogs / defectLog
    allHeatmapData / heatmapData
    allBottleneckAlerts / bottleneckAlert

Downtime events are served from merchandising.ProductionDowntime (the ERP's
machinery stoppage log).
"""

import graphene
from django.utils import timezone
from graphene_django import DjangoObjectType

from core.graphql import TYPE_REGISTRY
from merchandising.models import ProductionDowntime
from production.models import (
    BottleneckAlert,
    DefectLog,
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
        fields = ("id", "name", "location", "is_active", "created_at", "updated_at")


class LineCapacityType(DjangoObjectType):
    class Meta:
        model = LineCapacity
        fields = ("id", "date", "daily_capacity_pcs", "updated_at", "production_line")


class ProductionShiftType(DjangoObjectType):
    class Meta:
        model = ProductionShift
        fields = (
            "id", "name", "start_time", "end_time", "is_active",
            "created_at", "production_line",
        )


class ProductionRecordType(DjangoObjectType):
    class Meta:
        model = ProductionRecord
        fields = ("id", "date", "output_quantity", "notes", "created_at", "production_line")


class OEELogType(DjangoObjectType):
    class Meta:
        model = OEELog
        fields = (
            "id", "timestamp", "availability_rate", "performance_rate",
            "quality_rate", "oee_score", "production_line",
        )


class DowntimeEventType(DjangoObjectType):
    class Meta:
        model = ProductionDowntime
        fields = (
            "id", "start_datetime", "duration_hours", "cause", "description",
            "status", "created_at", "updated_at", "production_line", "style",
        )


class DefectLogType(DjangoObjectType):
    class Meta:
        model = DefectLog
        fields = (
            "id", "date", "defect_type", "checked_quantity", "defect_quantity",
            "defect_rate", "created_at", "production_line",
        )


class HeatmapDataType(DjangoObjectType):
    class Meta:
        model = HeatmapData
        fields = ("id", "metric", "value", "timestamp", "created_at", "production_line")


class BottleneckAlertType(DjangoObjectType):
    class Meta:
        model = BottleneckAlert
        fields = (
            "id", "alert_message", "is_resolved", "resolved_at",
            "created_at", "production_line",
        )


class ProductionLineType(DjangoObjectType):
    capacity_pcs = graphene.Int()
    capacity = graphene.Field(lambda: LineCapacityType)
    oee_logs = graphene.List(lambda: OEELogType)
    bottleneck_alerts = graphene.List(lambda: BottleneckAlertType)
    heatmap_data = graphene.List(lambda: HeatmapDataType)

    class Meta:
        model = ProductionLine
        fields = (
            "id", "name", "code", "location", "is_active",
            "created_at", "updated_at", "production_unit",
        )

    def resolve_capacity_pcs(self, info):
        return self.capacity

    def resolve_capacity(self, info):
        latest = self.capacities.order_by("-date", "-updated_at").first()
        if latest is not None:
            return latest
        return LineCapacity(
            production_line=self,
            date=timezone.localdate(),
            daily_capacity_pcs=self.capacity,
        )

    def resolve_oee_logs(self, info):
        return self.oee_logs.order_by("-timestamp")

    def resolve_bottleneck_alerts(self, info):
        return self.bottleneck_alerts.all()

    def resolve_heatmap_data(self, info):
        return self.heatmap_data.order_by("-timestamp")


_REGISTERED_TYPES = {
    ProductionUnit: ProductionUnitType,
    ProductionLine: ProductionLineType,
    LineCapacity: LineCapacityType,
    ProductionShift: ProductionShiftType,
    ProductionRecord: ProductionRecordType,
    OEELog: OEELogType,
    ProductionDowntime: DowntimeEventType,
    DefectLog: DefectLogType,
    HeatmapData: HeatmapDataType,
    BottleneckAlert: BottleneckAlertType,
}
for _model, _type in _REGISTERED_TYPES.items():
    TYPE_REGISTRY[f"{_model._meta.app_label}.{_model.__name__}"] = _type


class ProductionQuery(graphene.ObjectType):
    all_production_units = graphene.List(ProductionUnitType)
    production_unit = graphene.Field(ProductionUnitType, id=graphene.ID(required=True))

    all_production_lines = graphene.List(ProductionLineType)
    production_line = graphene.Field(ProductionLineType, id=graphene.ID(required=True))

    all_line_capacities = graphene.List(LineCapacityType)
    line_capacity = graphene.Field(LineCapacityType, id=graphene.ID(required=True))

    all_production_shifts = graphene.List(ProductionShiftType)
    production_shift = graphene.Field(ProductionShiftType, id=graphene.ID(required=True))

    all_production_records = graphene.List(ProductionRecordType)
    production_record = graphene.Field(ProductionRecordType, id=graphene.ID(required=True))

    all_oee_logs = graphene.List(OEELogType)
    oee_log = graphene.Field(OEELogType, id=graphene.ID(required=True))

    all_downtime_events = graphene.List(DowntimeEventType)
    downtime_event = graphene.Field(DowntimeEventType, id=graphene.ID(required=True))

    all_defect_logs = graphene.List(DefectLogType)
    defect_log = graphene.Field(DefectLogType, id=graphene.ID(required=True))

    all_heatmap_data = graphene.List(HeatmapDataType)
    heatmap_data = graphene.Field(HeatmapDataType, id=graphene.ID(required=True))

    all_bottleneck_alerts = graphene.List(BottleneckAlertType)
    bottleneck_alert = graphene.Field(BottleneckAlertType, id=graphene.ID(required=True))

    def resolve_all_production_units(root, info):
        return ProductionUnit.objects.all()

    def resolve_production_unit(root, info, id):
        return ProductionUnit.objects.filter(pk=id).first()

    def resolve_all_production_lines(root, info):
        return ProductionLine.objects.all()

    def resolve_production_line(root, info, id):
        return ProductionLine.objects.filter(pk=id).first()

    def resolve_all_line_capacities(root, info):
        return LineCapacity.objects.all()

    def resolve_line_capacity(root, info, id):
        return LineCapacity.objects.filter(pk=id).first()

    def resolve_all_production_shifts(root, info):
        return ProductionShift.objects.all()

    def resolve_production_shift(root, info, id):
        return ProductionShift.objects.filter(pk=id).first()

    def resolve_all_production_records(root, info):
        return ProductionRecord.objects.all()

    def resolve_production_record(root, info, id):
        return ProductionRecord.objects.filter(pk=id).first()

    def resolve_all_oee_logs(root, info):
        return OEELog.objects.all()

    def resolve_oee_log(root, info, id):
        return OEELog.objects.filter(pk=id).first()

    def resolve_all_downtime_events(root, info):
        return ProductionDowntime.objects.all()

    def resolve_downtime_event(root, info, id):
        return ProductionDowntime.objects.filter(pk=id).first()

    def resolve_all_defect_logs(root, info):
        return DefectLog.objects.all()

    def resolve_defect_log(root, info, id):
        return DefectLog.objects.filter(pk=id).first()

    def resolve_all_heatmap_data(root, info):
        return HeatmapData.objects.all()

    def resolve_heatmap_data(root, info, id):
        return HeatmapData.objects.filter(pk=id).first()

    def resolve_all_bottleneck_alerts(root, info):
        return BottleneckAlert.objects.all()

    def resolve_bottleneck_alert(root, info, id):
        return BottleneckAlert.objects.filter(pk=id).first()