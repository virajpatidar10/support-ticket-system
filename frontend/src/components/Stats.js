import React from 'react';

function Stats({ stats }) {
  if (!stats) {
    return <div className="card">Loading stats...</div>;
  }

  return (
    <div className="card">
      <h2>Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total_tickets}</h3>
          <p>Total Tickets</p>
        </div>
        
        <div className="stat-card">
          <h3>{stats.open_tickets}</h3>
          <p>Open Tickets</p>
        </div>
        
        <div className="stat-card">
          <h3>{stats.avg_tickets_per_day}</h3>
          <p>Avg Tickets/Day</p>
        </div>
      </div>

      <div className="breakdown">
        <h3>Priority Breakdown</h3>
        {Object.entries(stats.priority_breakdown).map(([priority, count]) => (
          <div key={priority} className="breakdown-item">
            <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>

      <div className="breakdown">
        <h3>Category Breakdown</h3>
        {Object.entries(stats.category_breakdown).map(([category, count]) => (
          <div key={category} className="breakdown-item">
            <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stats;
