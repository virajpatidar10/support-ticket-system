import React, { useState, useEffect } from 'react';
import './App.css';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import Stats from './components/Stats';
import Footer from './components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: ''
  });

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_URL}/api/tickets/?${params}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tickets/stats/`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filters]);

  const handleTicketCreated = () => {
    fetchTickets();
    fetchStats();
  };

  const handleTicketUpdated = () => {
    fetchTickets();
    fetchStats();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎫 Support Ticket System</h1>
        <p>AI-Powered Ticket Management</p>
      </header>
      
      <div className="container">
        <div className="main-content">
          <div>
            <TicketForm onTicketCreated={handleTicketCreated} apiUrl={API_URL} />
          </div>
          <div>
            <Stats stats={stats} />
          </div>
        </div>
        <div style={{ marginTop: '30px' }}>
          <TicketList 
            tickets={tickets} 
            filters={filters}
            setFilters={setFilters}
            onTicketUpdated={handleTicketUpdated}
            apiUrl={API_URL}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
