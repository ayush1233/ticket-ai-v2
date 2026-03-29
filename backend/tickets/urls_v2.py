from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v2_views import TicketViewSetV2

router = DefaultRouter()
router.register(r'tickets', TicketViewSetV2, basename='ticket-v2')

urlpatterns = [
    path('', include(router.urls)),
]
