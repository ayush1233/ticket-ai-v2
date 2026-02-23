from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """Serializer for Ticket CRUD operations."""

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'category',
            'priority', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class ClassifyRequestSerializer(serializers.Serializer):
    """Serializer for the classify endpoint request."""
    description = serializers.CharField(required=True, min_length=10)


class ClassifyResponseSerializer(serializers.Serializer):
    """Serializer for the classify endpoint response."""
    suggested_category = serializers.CharField()
    suggested_priority = serializers.CharField()
    confidence_score = serializers.FloatField()
