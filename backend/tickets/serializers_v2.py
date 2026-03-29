"""
V2 Serializers — Deliberate differences from V1 to demonstrate shadow comparison.

Changes from V1:
1. Added 'ticket_id' field (prefixed ID like "TKT-42")
2. Renamed 'created_at' → 'created_date' and 'updated_at' → 'last_modified'
3. Added 'age_hours' computed field (time since creation)
4. Added 'priority_level' numeric field (1=low, 2=medium, 3=high, 4=critical)
5. Added 'is_overdue' boolean field
6. Wrapped list responses in { "data": [...], "meta": {...} } envelope
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Ticket


PRIORITY_LEVELS = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4,
}


class TicketSerializerV2(serializers.ModelSerializer):
    """V2 serializer with additional computed fields and renamed timestamps."""

    ticket_id = serializers.SerializerMethodField()
    created_date = serializers.DateTimeField(source='created_at', read_only=True)
    last_modified = serializers.DateTimeField(source='updated_at', read_only=True)
    age_hours = serializers.SerializerMethodField()
    priority_level = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'title', 'description', 'category',
            'priority', 'priority_level', 'status',
            'created_date', 'last_modified', 'age_hours', 'is_overdue',
        ]
        read_only_fields = ['id', 'ticket_id', 'created_date', 'last_modified',
                            'age_hours', 'priority_level', 'is_overdue']

    def get_ticket_id(self, obj):
        return f"TKT-{obj.id}"

    def get_age_hours(self, obj):
        delta = timezone.now() - obj.created_at
        return round(delta.total_seconds() / 3600, 1)

    def get_priority_level(self, obj):
        return PRIORITY_LEVELS.get(obj.priority, 2)

    def get_is_overdue(self, obj):
        if obj.status in ('resolved', 'closed'):
            return False
        age_hours = (timezone.now() - obj.created_at).total_seconds() / 3600
        thresholds = {'critical': 4, 'high': 24, 'medium': 72, 'low': 168}
        return age_hours > thresholds.get(obj.priority, 72)

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()
