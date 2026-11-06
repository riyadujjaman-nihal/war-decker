// src/components/CardItem.tsx
import React from 'react';
import { Card, Faction } from '../types/game';

interface CardItemProps {
  card: Card;
  activeTurn: Faction;
  onPlay: () => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, activeTurn }) => {
  const isUsable = card.faction === activeTurn;

  return (
    <div 
      style={{
        border: isUsable ? '2px solid #2ecc71' : '1px solid #444',
        padding: '10px',
        borderRadius: '6px',
        background: '#2d2d2d',
        width: '130px',
        opacity: isUsable ? 1 : 0.4,
        color: '#fff',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ color: '#f1c40f', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
        Cost: {card.cost} SP
      </div>
      <strong style={{ fontSize: '13px', display: 'block', lineHeight: '1.2' }}>{card.name}</strong>
      <p style={{ fontSize: '11px', color: card.faction === 'USSR' ? '#ff7675' : '#74b9ff', margin: '4px 0' }}>
        {card.faction} | {card.type}
      </p>
      <div style={{ fontSize: '11px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#ff7675' }}>ATK: {card.attack}</span>
        <span style={{ color: '#74b9ff' }}>DEF: {card.defense}</span>
      </div>
    </div>
  );
};