import React from 'react';

function SimpleGame({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: '#1e6f5c',
        borderRadius: '24px',
        padding: '30px',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        <h2 style={{ color: '#ffd966', marginBottom: '20px' }}>🎮 GAME 🎮</h2>
        <p style={{ color: 'white', marginBottom: '20px' }}>Game coming soon!</p>
        <button 
          onClick={onClose}
          style={{
            background: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '60px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default SimpleGame;
