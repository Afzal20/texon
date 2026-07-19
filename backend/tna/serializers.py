from rest_framework import serializers
from merchandising.models import PurchaseOrder, Style
from .models import Task, JobOrder, Timeline, AlarmNotification


class TaskSerializer(serializers.ModelSerializer):
    parent_task = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), required=False, allow_null=True
    )
    purchase_order = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(), required=False, allow_null=True
    )
    style = serializers.PrimaryKeyRelatedField(
        queryset=Style.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            "id", "organization", "parent_task", "purchase_order", "style",
            "title", "description", "assigned_to", "start_date", "end_date",
            "duration_days", "priority", "status", "progress", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_progress(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Progress must be between 0 and 100.")
        return value

    def validate(self, data):
        if data.get("start_date") and data.get("end_date") and data["start_date"] > data["end_date"]:
            raise serializers.ValidationError("Start date cannot be after end date.")
        return data


class JobOrderSerializer(serializers.ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all())

    class Meta:
        model = JobOrder
        fields = [
            "id", "organization", "task", "job_order_number", "description",
            "assigned_department", "assigned_person", "start_date", "end_date",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        if data.get("start_date") and data.get("end_date") and data["start_date"] > data["end_date"]:
            raise serializers.ValidationError("Start date cannot be after end date.")
        return data


class TimelineSerializer(serializers.ModelSerializer):
    purchase_order = serializers.PrimaryKeyRelatedField(queryset=PurchaseOrder.objects.all())
    style = serializers.PrimaryKeyRelatedField(queryset=Style.objects.all())

    class Meta:
        model = Timeline
        fields = [
            "id", "organization", "purchase_order", "style", "milestone",
            "planned_date", "actual_date", "status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        if data.get("planned_date") and data.get("actual_date") and data["planned_date"] > data["actual_date"]:
            raise serializers.ValidationError("Planned date cannot be after actual date.")
        return data


class AlarmNotificationSerializer(serializers.ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = AlarmNotification
        fields = [
            "id", "organization", "task", "alarm_type", "recipient",
            "message", "scheduled_at", "sent_at", "status", "created_at",
        ]
        read_only_fields = ["created_at", "sent_at"]
