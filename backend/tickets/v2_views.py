"""
V2 Views — Deliberate differences from V1 to demonstrate shadow comparison.

Changes from V1:
1. Uses V2 serializer (different field names and extra computed fields)
2. Stats endpoint returns additional metrics (resolution_rate, overdue_count)
3. List endpoint wraps results in { "data": [...], "meta": {...} } envelope
4. Different ordering: by priority_level desc, then created_at desc
"""
from django.db.models import Count, Avg, F, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Ticket
from .serializers_v2 import TicketSerializerV2
from .services import classify_ticket


class TicketFilterV2(django_filters.FilterSet):
    category = django_filters.ChoiceFilter(choices=Ticket.Category.choices)
    priority = django_filters.ChoiceFilter(choices=Ticket.Priority.choices)
    status = django_filters.ChoiceFilter(choices=Ticket.Status.choices)

    class Meta:
        model = Ticket
        fields = ['category', 'priority', 'status']


class TicketViewSetV2(viewsets.ModelViewSet):
    """
    V2 ViewSet — Same data, different response shape.
    Used to generate meaningful shadow comparison mismatches.
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializerV2
    filterset_class = TicketFilterV2
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def list(self, request, *args, **kwargs):
        """V2 wraps list results in a data/meta envelope."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return Response({
                'data': paginated.data.get('results', serializer.data),
                'meta': {
                    'count': paginated.data.get('count', len(serializer.data)),
                    'next': paginated.data.get('next'),
                    'previous': paginated.data.get('previous'),
                    'api_version': 'v2',
                },
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
            'meta': {
                'count': len(serializer.data),
                'api_version': 'v2',
            },
        })

    def create(self, request, *args, **kwargs):
        if not request.data:
            raise ValidationError({"error": "Request body cannot be empty."})
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.data:
            raise ValidationError({"error": "Request body cannot be empty."})
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """V2 stats — same base metrics + resolution_rate, overdue_count, avg_age_hours."""
        qs = Ticket.objects.all()

        total_tickets = qs.count()
        open_tickets = qs.filter(status=Ticket.Status.OPEN).count()
        resolved_tickets = qs.filter(status=Ticket.Status.RESOLVED).count()
        in_progress_tickets = qs.filter(status=Ticket.Status.IN_PROGRESS).count()
        closed_tickets = qs.filter(status=Ticket.Status.CLOSED).count()

        # Avg tickets per day
        if total_tickets > 0:
            distinct_days = qs.annotate(
                date=TruncDate('created_at')
            ).values('date').distinct().count()
            avg_tickets_per_day = round(total_tickets / max(distinct_days, 1), 2)
        else:
            avg_tickets_per_day = 0

        priority_breakdown = dict(
            qs.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )

        category_breakdown = dict(
            qs.values('category')
            .annotate(count=Count('id'))
            .values_list('category', 'count')
        )

        # ── V2 additions ──
        resolution_rate = round(
            (resolved_tickets + closed_tickets) / max(total_tickets, 1) * 100, 1
        )

        now = timezone.now()
        overdue_count = 0
        for t in qs.filter(status__in=['open', 'in_progress']):
            age_h = (now - t.created_at).total_seconds() / 3600
            thresholds = {'critical': 4, 'high': 24, 'medium': 72, 'low': 168}
            if age_h > thresholds.get(t.priority, 72):
                overdue_count += 1

        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'resolved_tickets': resolved_tickets,
            'in_progress_tickets': in_progress_tickets,
            'closed_tickets': closed_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
            # V2 extra fields
            'resolution_rate': resolution_rate,
            'overdue_count': overdue_count,
            'api_version': 'v2',
        })

    @action(detail=False, methods=['post'])
    def classify(self, request):
        from .serializers import ClassifyRequestSerializer
        serializer = ClassifyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = classify_ticket(serializer.validated_data['description'])
        return Response(result, status=status.HTTP_200_OK)
