import React, { useState } from 'react';

export default function PlayingCards({ style }) {
  const [hovered, setHovered] = useState(false);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '1000px',
    ...style
  };

  const baseCardStyle = {
    position: 'absolute',
    width: 'clamp(90px, 15vw, 140px)',
    height: 'clamp(130px, 22vw, 200px)',
    backgroundColor: '#0c1a30',
    border: '1px solid rgba(240, 192, 64, 0.25)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 'clamp(10px, 1.5vw, 14px)',
    transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s ease, border-color 0.5s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    fontFamily: "'Inter', monospace",
    userSelect: 'none',
  };

  const getCardTransform = (index) => {
    if (hovered) {
      if (index === 0) return 'translateX(-55%) translateY(15%) rotate(-20deg) scale(1.05)';
      if (index === 1) return 'translateY(-15%) scale(1.15)';
      if (index === 2) return 'translateX(55%) translateY(15%) rotate(20deg) scale(1.05)';
    } else {
      if (index === 0) return 'translateX(-20%) translateY(5%) rotate(-8deg)';
      if (index === 1) return 'translateY(0) scale(1.02)';
      if (index === 2) return 'translateX(20%) translateY(5%) rotate(8deg)';
    }
  };

  const cards = [
    { value: 'A', suit: '♠', color: 'rgba(255,255,255,0.7)' },
    { value: 'K', suit: '♥', color: '#e07850' },
    { value: 'Q', suit: '♦', color: '#f0c040' }
  ];

  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cards.map((card, i) => (
        <div 
          key={i} 
          style={{
            ...baseCardStyle,
            zIndex: i,
            transform: getCardTransform(i),
            boxShadow: hovered ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 8px 24px rgba(0,0,0,0.5)',
            color: card.color,
            borderColor: hovered && i === 1 ? 'rgba(240, 192, 64, 0.6)' : 'rgba(240, 192, 64, 0.25)',
            background: hovered && i === 1 
              ? 'linear-gradient(135deg, rgba(12, 26, 48, 1) 0%, rgba(30, 45, 70, 1) 100%)' 
              : '#0c1a30'
          }}
        >
          <div style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 'bold', lineHeight: 1 }}>
            {card.value}
            <div style={{ fontSize: 'clamp(16px, 2.2vw, 24px)', marginTop: '-2px' }}>{card.suit}</div>
          </div>
          
          <div style={{ alignSelf: 'center', fontSize: 'clamp(40px, 6vw, 60px)', opacity: 0.9 }}>
            {card.suit}
          </div>
          
          <div style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 'bold', lineHeight: 1, transform: 'rotate(180deg)' }}>
            {card.value}
            <div style={{ fontSize: 'clamp(16px, 2.2vw, 24px)', marginTop: '-2px' }}>{card.suit}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
