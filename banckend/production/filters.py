import django_filters

from .models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    HeatmapData,
    OEELog,
    ProductionLine,
    ProductionRecord,
    ProductionUnit,
)


class ProductionUnitFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    location = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = ProductionUnit
        fields = ["name", "location"]


class ProductionLineFilter(django_filters.FilterSet):
    production_unit_id = django_filters.NumberFilter(field_name="production_unit_id")
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = ProductionLine
        fields = ["production_unit_id", "is_active"]


class ProductionRecordFilter(django_filters.FilterSet):
    production_line_id = django_filters.NumberFilter(field_name="production_line_id")
    shift_id = django_filters.NumberFilter(field_name="shift_id")
    timestamp = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = ProductionRecord
        fields = ["production_line_id", "shift_id", "timestamp"]


class OEELogFilter(django_filters.FilterSet):
    production_line_id = django_filters.NumberFilter(field_name="production_line_id")
    oee_score_gt = django_filters.NumberFilter(
        field_name="oee_score", lookup_expr="gt"
    )
    oee_score_lt = django_filters.NumberFilter(
        field_name="oee_score", lookup_expr="lt"
    )
    timestamp = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = OEELog
        fields = ["production_line_id", "oee_score_gt", "oee_score_lt", "timestamp"]


class DowntimeEventFilter(django_filters.FilterSet):
    production_line_id = django_filters.NumberFilter(field_name="production_line_id")
    reason = django_filters.CharFilter(lookup_expr="icontains")
    started_at = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = DowntimeEvent
        fields = ["production_line_id", "reason", "started_at"]


class DefectLogFilter(django_filters.FilterSet):
    production_line_id = django_filters.NumberFilter(field_name="production_line_id")
    defect_type = django_filters.CharFilter(lookup_expr="icontains")
    timestamp = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = DefectLog
        fields = ["production_line_id", "defect_type", "timestamp"]


class HeatmapDataFilter(django_filters.FilterSet):
    production_line_id = django_filters.NumberFilter(field_name="production_line_id")
    timestamp = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = HeatmapData
        fields = ["production_line_id", "timestamp"]


class BottleneckAlertFilter(django_filters.FilterSet):
    production_line_id = django_filters.NumberFilter(field_name="production_line_id")
    is_resolved = django_filters.BooleanFilter()

    class Meta:
        model = BottleneckAlert
        fields = ["production_line_id", "is_resolved"]
