from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Ticket
from .views import TicketViewSet

class TicketViewSetV2(TicketViewSet):
    """
    V2 ViewSet for Ticket CRUD operations.
    Inherits from V1 but adds:
    - Custom validation
    - Caching for stats endpoint
    """
    
    def create(self, request, *args, **kwargs):
        # Additional request validation in V2
        if not request.data:
            raise ValidationError({"error": "Request body cannot be empty."})
        
        # Call super which handles the standard creation logic
        return super().create(request, *args, **kwargs)
        
    def update(self, request, *args, **kwargs):
        if not request.data:
            raise ValidationError({"error": "Request body cannot be empty."})
            
        return super().update(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 5)) # Cache for 5 minutes
    def stats(self, request):
        """Return aggregated ticket statistics (Cached in V2)."""
        return super().stats(request)
