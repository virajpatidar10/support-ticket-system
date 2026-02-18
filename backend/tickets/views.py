from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .models import Ticket
from .serializers import TicketSerializer, ClassifyRequestSerializer, ClassifyResponseSerializer
from .llm_service import classify_ticket


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def get_queryset(self):
        queryset = Ticket.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Search in title and description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Return aggregated statistics using database-level operations.
        """
        # Total tickets
        total_tickets = Ticket.objects.count()
        
        # Open tickets
        open_tickets = Ticket.objects.filter(status='open').count()
        
        # Average tickets per day
        if total_tickets > 0:
            oldest_ticket = Ticket.objects.order_by('created_at').first()
            if oldest_ticket:
                days_diff = (timezone.now() - oldest_ticket.created_at).days + 1
                avg_tickets_per_day = round(total_tickets / days_diff, 1)
            else:
                avg_tickets_per_day = 0.0
        else:
            avg_tickets_per_day = 0.0
        
        # Priority breakdown using database aggregation
        priority_breakdown = dict(
            Ticket.objects.values('priority').annotate(count=Count('id')).values_list('priority', 'count')
        )
        
        # Ensure all priorities are present
        for priority in ['low', 'medium', 'high', 'critical']:
            if priority not in priority_breakdown:
                priority_breakdown[priority] = 0
        
        # Category breakdown using database aggregation
        category_breakdown = dict(
            Ticket.objects.values('category').annotate(count=Count('id')).values_list('category', 'count')
        )
        
        # Ensure all categories are present
        for category in ['billing', 'technical', 'account', 'general']:
            if category not in category_breakdown:
                category_breakdown[category] = 0
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown
        })
    
    @action(detail=False, methods=['post'])
    def classify(self, request):
        """
        Classify ticket description using LLM.
        """
        serializer = ClassifyRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        description = serializer.validated_data['description']
        result = classify_ticket(description)
        
        return Response(result)
