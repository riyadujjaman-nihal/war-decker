// src/components/UnitUnit.tsx
import React from 'react';
import { CardInstance, Faction } from '../types/game';

interface UnitUnitProps {
  unit: CardInstance;
  activeTurn: Faction;
  isSelected: boolean;
  selectedAttackerId: string | null;
  onSelect: () => void;
}

export const UnitUnit: React.FC<UnitUnitProps> = ({
  unit,
  activeTurn,
  isSelected,
  selectedAttackerId,
}) => {
  const isEnemy = unit.faction !== activeTurn;

  return (
    <div 
      style={{ 
        border: isSelected 
          ? '3px solid #f1c40f' 
          : isEnemy && selectedAttackerId 
          ? '3px dashed #e74c3c' 
          : '2px solid #555', 
        padding: '10px', 
        borderRadius: '6px', 
        background: unit.hasAttacked ? '#1a1a1a' : '#282828', 
        width: '130px',
        cursor: 'pointer',
        opacity: unit.hasAttacked ? 0.6 : 1,
        color: '#fff',
        boxSizing: 'border-box'
      }}
    >
      <strong style={{ fontSize: '13px', display: 'block', lineHeight: '1.2' }}>{unit.name}</strong>
      <p style={{ margin: '3px 0', fontSize: '11px', color: unit.faction === 'USSR' ? '#ff7675' : '#74b9ff' }}>
        {unit.faction} | {unit.type}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: '#ff7675' }}>ATK: {unit.attack}</span>
        <span style={{ color: '#74b9ff' }}>HP: {unit.currentHp}/{unit.defense}</span>
      </div>
      {unit.hasAttacked && <p style={{ fontSize: '9px', color: '#e74c3c', margin: '3px 0 0 0', fontWeight: 'bold' }}>[EXHAUSTED]</p>}
    </div>
  );
};