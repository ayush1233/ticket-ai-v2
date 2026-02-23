from django.db.models import Count, Min, Max
from django.db.models.functions import TruncDate
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Ticket
from .serializers import TicketSerializer, ClassifyRequestSerializer
from .services import classify_ticket


class TicketFilter(django_filters.FilterSet):
    """Custom filterset for ticket queries."""
    category = django_filters.ChoiceFilter(choices=Ticket.Category.choices)
    priority = django_filters.ChoiceFilter(choices=Ticket.Priority.choices)
    status = django_filters.ChoiceFilter(choices=Ticket.Status.choices)

    class Meta:
        model = Ticket
        fields = ['category', 'priority', 'status']


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket CRUD operations plus stats and classification.
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filterset_class = TicketFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return aggregated ticket statistics using Django ORM aggregation."""
        qs = Ticket.objects.all()

        total_tickets = qs.count()
        open_tickets = qs.filter(status=Ticket.Status.OPEN).count()
        resolved_tickets = qs.filter(status=Ticket.Status.RESOLVED).count()
        in_progress_tickets = qs.filter(status=Ticket.Status.IN_PROGRESS).count()
        closed_tickets = qs.filter(status=Ticket.Status.CLOSED).count()

        # Average tickets per day using ORM aggregation
        if total_tickets > 0:
            distinct_days = qs.annotate(
                date=TruncDate('created_at')
            ).values('date').distinct().count()
            avg_tickets_per_day = round(total_tickets / max(distinct_days, 1), 2)
        else:
            avg_tickets_per_day = 0

        # Priority breakdown via ORM aggregation
        priority_breakdown = dict(
            qs.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )

        # Category breakdown via ORM aggregation
        category_breakdown = dict(
            qs.values('category')
            .annotate(count=Count('id'))
            .values_list('category', 'count')
        )

        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'resolved_tickets': resolved_tickets,
            'in_progress_tickets': in_progress_tickets,
            'closed_tickets': closed_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
        })

    @action(detail=False, methods=['post'])
    def classify(self, request):
        """Classify a ticket description using OpenAI."""
        serializer = ClassifyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        description = serializer.validated_data['description']
        result = classify_ticket(description)

        return Response(result, status=status.HTTP_200_OK)
