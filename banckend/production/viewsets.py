from decimal import Decimal

from django.db import transaction
from django.db.models import Avg, Count
from django.utils import timezone
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    extend_schema,
    extend_schema_view,
    inline_serializer,
)
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import (
    BottleneckAlertFilter,
    DefectLogFilter,
    DowntimeEventFilter,
    HeatmapDataFilter,
    OEELogFilter,
    ProductionLineFilter,
    ProductionRecordFilter,
    ProductionUnitFilter,
)
from .models import (
    BottleneckAlert,
    DefectLog,
    DowntimeEvent,
    HeatmapData,
    OEELog,
    ProductionLine,
    ProductionRecord,
    ProductionShift,
    ProductionUnit,
)
from skeleton.pagination import ProductionPagination
from skeleton.permissions import (
    IsOrganizationMember,
    IsProductionLineAccessible,
    IsProductionManager,
)
from .serializers import (
    BottleneckAlertSerializer,
    BulkProductionRecordSerializer,
    DefectLogSerializer,
    DowntimeEventSerializer,
    HeatmapDataSerializer,
    OEELogSerializer,
    ProductionLineSerializer,
    ProductionRecordDetailSerializer,
    ProductionRecordListSerializer,
    ProductionShiftSerializer,
    ProductionUnitDetailSerializer,
    ProductionUnitListSerializer,
    RecordOEESerializer,
    RecordOutputSerializer,
    ReportDefectSerializer,
    ReportDowntimeSerializer,
    ResolveBottleneckSerializer,
)


# ──────────────────────────────────────────────
# ProductionUnit
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(
        summary="List production units",
        description="Returns all production units for the authenticated user's organization.",
    ),
    retrieve=extend_schema(
        summary="Retrieve production unit",
        description="Returns a single production unit with nested production lines.",
    ),
    create=extend_schema(summary="Create production unit"),
    update=extend_schema(summary="Update production unit"),
    partial_update=extend_schema(summary="Partially update production unit"),
    destroy=extend_schema(summary="Delete production unit"),
)
class ProductionUnitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = ProductionUnitFilter

    def get_queryset(self):
        qs = ProductionUnit.objects.filter(
            organization=self.request.user.organization
        )
        if self.action == "list":
            qs = qs.annotate(lines_count=Count("lines"))
        else:
            qs = qs.prefetch_related("lines__capacity")
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ProductionUnitListSerializer
        return ProductionUnitDetailSerializer

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


# ──────────────────────────────────────────────
# ProductionLine
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(
        summary="List production lines",
        description="Returns production lines scoped to the user's organization.",
    ),
    retrieve=extend_schema(summary="Retrieve production line"),
    create=extend_schema(summary="Create production line"),
    update=extend_schema(summary="Update production line"),
    partial_update=extend_schema(summary="Partially update production line"),
    destroy=extend_schema(summary="Delete production line"),
)
class ProductionLineViewSet(viewsets.ModelViewSet):
    serializer_class = ProductionLineSerializer
    permission_classes = [IsOrganizationMember, IsProductionLineAccessible]
    pagination_class = ProductionPagination
    filterset_class = ProductionLineFilter

    def get_queryset(self):
        return (
            ProductionLine.objects.filter(
                production_unit__organization=self.request.user.organization
            )
            .select_related("production_unit", "capacity")
        )

    # ── record-output ──────────────────────────
    @extend_schema(
        summary="Record production output",
        request=RecordOutputSerializer,
        responses={201: ProductionRecordDetailSerializer},
        examples=[
            OpenApiExample(
                "Record output",
                value={"shift_id": 1, "output_pcs": 4500, "timestamp": "2026-06-29T08:00:00Z"},
            )
        ],
    )
    @action(detail=True, methods=["post"], url_path="record-output")
    def record_output(self, request, pk=None):
        line = self.get_object()
        ser = RecordOutputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # Verify shift belongs to the same org
        try:
            shift = ProductionShift.objects.get(
                pk=data["shift_id"],
                organization=request.user.organization,
            )
        except ProductionShift.DoesNotExist:
            return Response(
                {"shift_id": "Shift not found in your organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            record = ProductionRecord.objects.create(
                production_line=line,
                shift=shift,
                output_pcs=data["output_pcs"],
                timestamp=data.get("timestamp", timezone.now()),
            )

        return Response(
            ProductionRecordDetailSerializer(record).data,
            status=status.HTTP_201_CREATED,
        )

    # ── record-oee ─────────────────────────────
    @extend_schema(
        summary="Record OEE metrics",
        request=RecordOEESerializer,
        responses={201: OEELogSerializer},
        examples=[
            OpenApiExample(
                "Record OEE",
                value={
                    "availability_rate": "92.50",
                    "performance_rate": "88.00",
                    "quality_rate": "96.00",
                    "timestamp": "2026-06-29T08:00:00Z",
                },
            )
        ],
    )
    @action(detail=True, methods=["post"], url_path="record-oee")
    def record_oee(self, request, pk=None):
        line = self.get_object()
        ser = RecordOEESerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        a = data["availability_rate"]
        p = data["performance_rate"]
        q = data["quality_rate"]
        oee = round(float(a) * float(p) * float(q) / 10_000, 2)

        with transaction.atomic():
            log = OEELog.objects.create(
                production_line=line,
                availability_rate=a,
                performance_rate=p,
                quality_rate=q,
                oee_score=Decimal(str(oee)),
                timestamp=data.get("timestamp", timezone.now()),
            )

        return Response(OEELogSerializer(log).data, status=status.HTTP_201_CREATED)

    # ── report-downtime ────────────────────────
    @extend_schema(
        summary="Report downtime event",
        request=ReportDowntimeSerializer,
        responses={201: DowntimeEventSerializer},
        examples=[
            OpenApiExample(
                "Report downtime",
                value={
                    "reason": "Motor failure on Line 04",
                    "duration_minutes": 45,
                    "started_at": "2026-06-29T06:30:00Z",
                },
            )
        ],
    )
    @action(detail=True, methods=["post"], url_path="report-downtime")
    def report_downtime(self, request, pk=None):
        line = self.get_object()
        ser = ReportDowntimeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        with transaction.atomic():
            event = DowntimeEvent.objects.create(
                production_line=line,
                reason=data["reason"],
                duration_minutes=data["duration_minutes"],
                started_at=data["started_at"],
            )

        return Response(
            DowntimeEventSerializer(event).data, status=status.HTTP_201_CREATED
        )

    # ── report-defect ──────────────────────────
    @extend_schema(
        summary="Report defect",
        request=ReportDefectSerializer,
        responses={201: DefectLogSerializer},
        examples=[
            OpenApiExample(
                "Report defect",
                value={
                    "defect_type": "Broken stitch",
                    "quantity": 12,
                    "checked_units": 500,
                },
            )
        ],
    )
    @action(detail=True, methods=["post"], url_path="report-defect")
    def report_defect(self, request, pk=None):
        line = self.get_object()
        ser = ReportDefectSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        with transaction.atomic():
            defect = DefectLog.objects.create(
                production_line=line,
                defect_type=data["defect_type"],
                quantity=data["quantity"],
                checked_units=data["checked_units"],
                timestamp=timezone.now(),
            )

        return Response(
            DefectLogSerializer(defect).data, status=status.HTTP_201_CREATED
        )

    # ── calculate-oee ──────────────────────────
    @extend_schema(
        summary="Calculate OEE for a date range",
        parameters=[
            OpenApiParameter(
                name="start_date",
                type=str,
                description="ISO 8601 date-time (inclusive)",
            ),
            OpenApiParameter(
                name="end_date",
                type=str,
                description="ISO 8601 date-time (inclusive)",
            ),
        ],
        responses={
            200: inline_serializer(
                name="OEESummary",
                fields={
                    "production_line_id": drf_serializers.IntegerField(),
                    "start_date": drf_serializers.CharField(),
                    "end_date": drf_serializers.CharField(),
                    "avg_availability": drf_serializers.FloatField(),
                    "avg_performance": drf_serializers.FloatField(),
                    "avg_quality": drf_serializers.FloatField(),
                    "avg_oee": drf_serializers.FloatField(),
                    "records_count": drf_serializers.IntegerField(),
                },
            )
        },
    )
    @action(detail=True, methods=["get"], url_path="calculate-oee")
    def calculate_oee_for_line(self, request, pk=None):
        line = self.get_object()
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")

        qs = OEELog.objects.filter(production_line=line)
        if start:
            qs = qs.filter(timestamp__gte=start)
        if end:
            qs = qs.filter(timestamp__lte=end)

        agg = qs.aggregate(
            avg_availability=Avg("availability_rate"),
            avg_performance=Avg("performance_rate"),
            avg_quality=Avg("quality_rate"),
            avg_oee=Avg("oee_score"),
            records_count=Count("id"),
        )

        return Response(
            {
                "production_line_id": line.pk,
                "start_date": start,
                "end_date": end,
                **{k: float(v) if v is not None else None for k, v in agg.items()},
            }
        )


# ──────────────────────────────────────────────
# ProductionShift
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List production shifts"),
    retrieve=extend_schema(summary="Retrieve production shift"),
    create=extend_schema(summary="Create production shift"),
    update=extend_schema(summary="Update production shift"),
    partial_update=extend_schema(summary="Partially update production shift"),
    destroy=extend_schema(summary="Delete production shift"),
)
class ProductionShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ProductionShiftSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination

    def get_queryset(self):
        return ProductionShift.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


# ──────────────────────────────────────────────
# ProductionRecord
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List production records"),
    retrieve=extend_schema(summary="Retrieve production record"),
    create=extend_schema(summary="Create production record"),
    update=extend_schema(summary="Update production record"),
    partial_update=extend_schema(summary="Partially update production record"),
    destroy=extend_schema(summary="Delete production record"),
)
class ProductionRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = ProductionRecordFilter

    def get_queryset(self):
        return (
            ProductionRecord.objects.filter(
                production_line__production_unit__organization=self.request.user.organization
            )
            .select_related("production_line__capacity", "shift")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ProductionRecordListSerializer
        if self.action == "bulk_create":
            return BulkProductionRecordSerializer
        return ProductionRecordDetailSerializer

    @extend_schema(
        summary="Bulk create production records",
        request=BulkProductionRecordSerializer,
        responses={201: ProductionRecordDetailSerializer(many=True)},
        examples=[
            OpenApiExample(
                "Bulk create",
                value={
                    "records": [
                        {
                            "production_line": 1,
                            "shift": 1,
                            "output_pcs": 4500,
                            "timestamp": "2026-06-29T08:00:00Z",
                        },
                        {
                            "production_line": 1,
                            "shift": 2,
                            "output_pcs": 3800,
                            "timestamp": "2026-06-29T16:00:00Z",
                        },
                    ]
                },
            )
        ],
    )
    @action(detail=False, methods=["post"], url_path="bulk-create")
    def bulk_create(self, request):
        ser = BulkProductionRecordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        with transaction.atomic():
            instances = ser.save()

        return Response(
            ProductionRecordDetailSerializer(instances, many=True).data,
            status=status.HTTP_201_CREATED,
        )


# ──────────────────────────────────────────────
# OEELog
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List OEE logs"),
    retrieve=extend_schema(summary="Retrieve OEE log"),
    create=extend_schema(summary="Create OEE log"),
    update=extend_schema(summary="Update OEE log"),
    partial_update=extend_schema(summary="Partially update OEE log"),
    destroy=extend_schema(summary="Delete OEE log"),
)
class OEELogViewSet(viewsets.ModelViewSet):
    serializer_class = OEELogSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = OEELogFilter

    def get_queryset(self):
        return OEELog.objects.filter(
            production_line__production_unit__organization=self.request.user.organization
        ).select_related("production_line")


# ──────────────────────────────────────────────
# DowntimeEvent
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List downtime events"),
    retrieve=extend_schema(summary="Retrieve downtime event"),
    create=extend_schema(summary="Create downtime event"),
    update=extend_schema(summary="Update downtime event"),
    partial_update=extend_schema(summary="Partially update downtime event"),
    destroy=extend_schema(summary="Delete downtime event"),
)
class DowntimeEventViewSet(viewsets.ModelViewSet):
    serializer_class = DowntimeEventSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = DowntimeEventFilter

    def get_queryset(self):
        return DowntimeEvent.objects.filter(
            production_line__production_unit__organization=self.request.user.organization
        ).select_related("production_line")


# ──────────────────────────────────────────────
# DefectLog
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List defect logs"),
    retrieve=extend_schema(summary="Retrieve defect log"),
    create=extend_schema(summary="Create defect log"),
    update=extend_schema(summary="Update defect log"),
    partial_update=extend_schema(summary="Partially update defect log"),
    destroy=extend_schema(summary="Delete defect log"),
)
class DefectLogViewSet(viewsets.ModelViewSet):
    serializer_class = DefectLogSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = DefectLogFilter

    def get_queryset(self):
        return DefectLog.objects.filter(
            production_line__production_unit__organization=self.request.user.organization
        ).select_related("production_line")


# ──────────────────────────────────────────────
# HeatmapData
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List heatmap data"),
    retrieve=extend_schema(summary="Retrieve heatmap data"),
    create=extend_schema(summary="Create heatmap data"),
    update=extend_schema(summary="Update heatmap data"),
    partial_update=extend_schema(summary="Partially update heatmap data"),
    destroy=extend_schema(summary="Delete heatmap data"),
)
class HeatmapDataViewSet(viewsets.ModelViewSet):
    serializer_class = HeatmapDataSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = HeatmapDataFilter

    def get_queryset(self):
        return HeatmapData.objects.filter(
            production_line__production_unit__organization=self.request.user.organization
        ).select_related("production_line")


# ──────────────────────────────────────────────
# BottleneckAlert
# ──────────────────────────────────────────────


@extend_schema_view(
    list=extend_schema(summary="List bottleneck alerts"),
    retrieve=extend_schema(summary="Retrieve bottleneck alert"),
    create=extend_schema(summary="Create bottleneck alert"),
    update=extend_schema(summary="Update bottleneck alert"),
    partial_update=extend_schema(summary="Partially update bottleneck alert"),
    destroy=extend_schema(summary="Delete bottleneck alert"),
)
class BottleneckAlertViewSet(viewsets.ModelViewSet):
    serializer_class = BottleneckAlertSerializer
    permission_classes = [IsOrganizationMember]
    pagination_class = ProductionPagination
    filterset_class = BottleneckAlertFilter

    def get_queryset(self):
        return BottleneckAlert.objects.filter(
            production_line__production_unit__organization=self.request.user.organization
        ).select_related("production_line")

    @extend_schema(
        summary="Resolve a bottleneck alert",
        request=ResolveBottleneckSerializer,
        responses={200: BottleneckAlertSerializer},
        examples=[
            OpenApiExample(
                "Resolve alert",
                value={"resolved_at": "2026-06-29T12:00:00Z"},
            )
        ],
    )
    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        alert = self.get_object()

        if alert.is_resolved:
            return Response(
                {"detail": "Alert is already resolved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ser = ResolveBottleneckSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        with transaction.atomic():
            alert.is_resolved = True
            alert.resolved_at = ser.validated_data.get("resolved_at", timezone.now())
            alert.save(update_fields=["is_resolved", "resolved_at"])

        return Response(BottleneckAlertSerializer(alert).data)
