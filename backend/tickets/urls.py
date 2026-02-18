from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, health_check

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
]
