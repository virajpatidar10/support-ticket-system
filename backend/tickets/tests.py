from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Ticket


class TicketModelTest(TestCase):
    def test_create_ticket(self):
        ticket = Ticket.objects.create(
            title="Test Ticket",
            description="Test description",
            category="general",
            priority="low"
        )
        self.assertEqual(ticket.title, "Test Ticket")
        self.assertEqual(ticket.status, "open")


class TicketAPITest(APITestCase):
    def test_create_ticket(self):
        data = {
            "title": "API Test",
            "description": "Testing the API",
            "category": "technical",
            "priority": "medium"
        }
        response = self.client.post('/api/tickets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 1)
    
    def test_list_tickets(self):
        Ticket.objects.create(
            title="Test 1",
            description="Desc 1",
            category="billing",
            priority="high"
        )
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_filter_by_category(self):
        Ticket.objects.create(
            title="Test 1",
            description="Desc 1",
            category="billing",
            priority="high"
        )
        Ticket.objects.create(
            title="Test 2",
            description="Desc 2",
            category="technical",
            priority="low"
        )
        response = self.client.get('/api/tickets/?category=billing')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], 'billing')
    
    def test_stats_endpoint(self):
        Ticket.objects.create(
            title="Test 1",
            description="Desc 1",
            category="billing",
            priority="high"
        )
        response = self.client.get('/api/tickets/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_tickets'], 1)
        self.assertEqual(response.data['open_tickets'], 1)
