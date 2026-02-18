import React, { useState } from 'react';

function TicketForm({ onTicketCreated, apiUrl }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: ''
  });
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDescriptionBlur = async () => {
    if (formData.description.trim().length > 10) {
      setIsClassifying(true);
      try {
        const response = await fetch(`${apiUrl}/api/tickets/classify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: formData.description })
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            category: data.suggested_category || prev.category,
            priority: data.suggested_priority || prev.priority
          }));
        }
      } catch (error) {
        console.error('Classification error:', error);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}/api/tickets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: ''
        });
        setSuccessMessage('Ticket created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        onTicketCreated();
      } else {
        setErrorMessage('Failed to create ticket. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrorMessage('Network error. Please check your connection.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit a Ticket</h2>
      {successMessage && <div className="success-message">✅ {successMessage}</div>}
      {errorMessage && <div className="error-message">❌ {errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Title * 
            <span style={{ float: 'right', fontSize: '0.85rem', color: formData.title.length > 180 ? '#f45c43' : '#999' }}>
              {formData.title.length}/200
            </span>
          </label>
          <input
            type="text"
            id="title"
            maxLength="200"
            required
            placeholder="Brief description of your issue"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description *
            {isClassifying && <span className="loading-indicator">AI is analyzing...</span>}
          </label>
          <textarea
            id="description"
            required
            placeholder="Describe your issue in detail..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onBlur={handleDescriptionBlur}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category * {formData.category && '🤖'}</label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select category</option>
              <option value="billing">💳 Billing</option>
              <option value="technical">🔧 Technical</option>
              <option value="account">👤 Account</option>
              <option value="general">📋 General</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority * {formData.priority && '🤖'}</label>
            <select
              id="priority"
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="">Select priority</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Ticket'}
        </button>
      </form>
    </div>
  );
}

export default TicketForm;
