import React from 'react';

function Footer() {
  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '20px',
      textAlign: 'center',
      marginTop: '40px',
      borderTop: '2px solid #667eea'
    }}>
      <p style={{ margin: 0, color: '#666' }}>
        © 2024 Support Ticket System | Built with ❤️ using React & Django
      </p>
    </footer>
  );
}

export default Footer;
