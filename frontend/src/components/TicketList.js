import React from 'react';

function TicketList({ tickets, filters, setFilters, onTicketUpdated, apiUrl }) {
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/api/tickets/${ticketId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onTicketUpdated();
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="card">
      <h2>🎫 All Tickets</h2>
      
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="billing">💳 Billing</option>
          <option value="technical">🔧 Technical</option>
          <option value="account">👤 Account</option>
          <option value="general">📋 General</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🟠 High</option>
          <option value="critical">🔴 Critical</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="open">📂 Open</option>
          <option value="in_progress">⏳ In Progress</option>
          <option value="resolved">✅ Resolved</option>
          <option value="closed">🔒 Closed</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="no-tickets">No tickets found</div>
      ) : (
        tickets.map(ticket => (
          <div key={ticket.id} className="ticket-item">
            <div className="ticket-header">
              <h3 className="ticket-title">{ticket.title}</h3>
            </div>
            
            <div className="ticket-meta">
              <span className="badge badge-category">
                {ticket.category === 'billing' && '💳'} 
                {ticket.category === 'technical' && '🔧'} 
                {ticket.category === 'account' && '👤'} 
                {ticket.category === 'general' && '📋'} 
                {' '}{ticket.category}
              </span>
              <span className={`badge badge-priority-${ticket.priority}`}>
                {ticket.priority === 'low' && '🟢'} 
                {ticket.priority === 'medium' && '🟡'} 
                {ticket.priority === 'high' && '🟠'} 
                {ticket.priority === 'critical' && '🔴'} 
                {' '}{ticket.priority}
              </span>
              <span className="badge badge-status">
                {ticket.status === 'open' && '📂'} 
                {ticket.status === 'in_progress' && '⏳'} 
                {ticket.status === 'resolved' && '✅'} 
                {ticket.status === 'closed' && '🔒'} 
                {' '}{ticket.status.replace('_', ' ')}
              </span>
            </div>

            <p className="ticket-description">
              {truncateText(ticket.description)}
            </p>

            <div className="ticket-footer">
              <span>🕒 {formatDate(ticket.created_at)}</span>
              <select
                className="status-selector"
                value={ticket.status}
                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
              >
                <option value="open">📂 Open</option>
                <option value="in_progress">⏳ In Progress</option>
                <option value="resolved">✅ Resolved</option>
                <option value="closed">🔒 Closed</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TicketList;
