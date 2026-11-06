import { useState } from 'react';
import { EASTERN_FRONT_CARDS } from './data/cards';
import { Card, CardInstance, Faction, Lane } from './types/game';
import { createInitialTurnState, advanceTurn } from './engine/turn-machanic';
import { validateTargeting, getAllowedLanes } from './engine/rules';
import { executeCombatSequence } from './engine/combat';
import { CardItem } from './components/Carditem';
import { UnitUnit } from './components/Unit';

export default function App() {
  const [turnState, setTurnState] = useState(createInitialTurnState());
  const [board, setBoard] = useState<CardInstance[]>([]);
  const [hand, setHand] = useState<Card[]>(EASTERN_FRONT_CARDS);
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);

  const activeFaction = turnState.activePlayer;
  const activePlayerState = turnState.players[activeFaction];

  // Play a card to a specific lane with rule validation
  const playCardToLane = (card: Card, index: number, targetLane: Lane) => {
    if (card.faction !== activeFaction) {
      alert(`It is currently the ${activeFaction}'s turn!`);
      return;
    }

    if (activePlayerState.currentSupply < card.cost) {
      alert("Not enough Supply Points!");
      return;
    }

    // Validate lane restrictions based on unit type
    const allowedLanes = getAllowedLanes(card.type);
    if (!allowedLanes.includes(targetLane)) {
      alert(`${card.type} units cannot be deployed to the ${targetLane}! Allowed: ${allowedLanes.join(', ')}`);
      return;
    }

    // Deduct supply
    setTurnState({
      ...turnState,
      players: {
        ...turnState.players,
        [activeFaction]: {
          ...activePlayerState,
          currentSupply: activePlayerState.currentSupply - card.cost
        }
      }
    });

    // Remove from hand and add to board
    setHand(hand.filter((_, i) => i !== index));
    const newUnit: CardInstance = {
      ...card,
      instanceId: Math.random().toString(),
      currentHp: card.defense,
      hasAttacked: false,
      lane: targetLane
    };
    setBoard([...board, newUnit]);
  };

  // Handle targeting and combat execution
  const handleUnitClick = (targetUnit: CardInstance) => {
    if (targetUnit.faction === activeFaction) {
      if (targetUnit.hasAttacked) return;
      setSelectedAttackerId(targetUnit.instanceId === selectedAttackerId ? null : targetUnit.instanceId);
      return;
    }

    if (selectedAttackerId && targetUnit.faction !== activeFaction) {
      const attacker = board.find((u) => u.instanceId === selectedAttackerId);
      if (!attacker) return;

      // Validate targeting rules (Cover, Range, Exhaustion)
      const validation = validateTargeting(attacker, targetUnit, board);
      if (!validation.valid) {
        alert(validation.reason);
        return;
      }

      // Execute combat sequence
      const result = executeCombatSequence(attacker, targetUnit, board);
      setBoard(result.updatedBoard);
      setCombatLogs((prev) => [...result.combatLog, ...prev.slice(0, 4)]);
      setSelectedAttackerId(null);
    }
  };

  // Pass turn to the next player
  const handleEndTurn = () => {
    const { nextTurnState, updatedBoard } = advanceTurn(turnState, board);
    setTurnState(nextTurnState);
    setBoard(updatedBoard);
    setSelectedAttackerId(null);
  };

  // Separate board units by faction and lane for rendering
  const gerBackline = board.filter(u => u.faction === 'GERMANY' && u.lane === 'BACKLINE');
  const gerFrontline = board.filter(u => u.faction === 'GERMANY' && u.lane === 'FRONTLINE');
  const ussrFrontline = board.filter(u => u.faction === 'USSR' && u.lane === 'FRONTLINE');
  const ussrBackline = board.filter(u => u.faction === 'USSR' && u.lane === 'BACKLINE');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#121212', color: '#fff', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>WW2 Eastern Front: Command</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>Turn {turnState.turnNumber} | Active Turn: <span style={{ color: activeFaction === 'USSR' ? '#ff4d4d' : '#4da6ff', fontWeight: 'bold' }}>{activeFaction}</span></p>
        </div>
        <div style={{ background: '#1e1e1e', padding: '10px 15px', borderRadius: '6px', border: '1px solid #333' }}>
          <div>Supply: <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{activePlayerState.currentSupply} / {activePlayerState.maxSupply} SP</span></div>
          <button 
            onClick={handleEndTurn}
            style={{ marginTop: '8px', padding: '6px 12px', background: '#e67e22', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', width: '100%' }}
          >
            End Turn
          </button>
        </div>
      </header>

      {/* 4-LANE BATTLEFIELD GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
        
        {/* GERMANY BACKLINE */}
        <div style={{ background: '#221a1a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #4da6ff' }}>
          <div style={{ fontSize: '12px', color: '#74b9ff', fontWeight: 'bold', marginBottom: '8px' }}>GERMAN BACKLINE (Support & Artillery)</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {gerBackline.length === 0 ? <span style={{ color: '#666', fontSize: '13px' }}>No units</span> : null}
            {gerBackline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

        {/* GERMANY FRONTLINE */}
        <div style={{ background: '#26221a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #f39c12' }}>
          <div style={{ fontSize: '12px', color: '#f1c40f', fontWeight: 'bold', marginBottom: '8px' }}>GERMAN FRONTLINE (Armor & Infantry Engagement Zone)</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {gerFrontline.length === 0 ? <span style={{ color: '#666', fontSize: '13px' }}>No units</span> : null}
            {gerFrontline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

        <hr style={{ borderColor: '#444', margin: '5px 0' }} />

        {/* USSR FRONTLINE */}
        <div style={{ background: '#221e1a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #e74c3c' }}>
          <div style={{ fontSize: '12px', color: '#ff7675', fontWeight: 'bold', marginBottom: '8px' }}>SOVIET FRONTLINE (Armor & Infantry Engagement Zone)</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {ussrFrontline.length === 0 ? <span style={{ color: '#666', fontSize: '13px' }}>No units</span> : null}
            {ussrFrontline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

        {/* USSR BACKLINE */}
        <div style={{ background: '#1a221a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #2ecc71' }}>
          <div style={{ fontSize: '12px', color: '#55efc4', fontWeight: 'bold', marginBottom: '8px' }}>SOVIET BACKLINE (Support & Artillery)</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {ussrBackline.length === 0 ? <span style={{ color: '#666', fontSize: '13px' }}>No units</span> : null}
            {ussrBackline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* COMBAT LOG & HAND SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Combat Log */}
        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>Combat Log</h3>
          <div style={{ fontSize: '12px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {combatLogs.length === 0 ? <em>No actions recorded yet.</em> : null}
            {combatLogs.map((log, i) => <div key={i}>• {log}</div>)}
          </div>
        </div>

        {/* Hand */}
        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>Your Hand (Click card to deploy to Frontline or Backline)</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {hand.map((card, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <CardItem card={card} activeTurn={activeFaction} onPlay={() => {}} />
                {card.faction === activeFaction && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => playCardToLane(card, index, 'FRONTLINE')}
                      style={{ fontSize: '10px', padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Deploy Front
                    </button>
                    <button 
                      onClick={() => playCardToLane(card, index, 'BACKLINE')}
                      style={{ fontSize: '10px', padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Deploy Back
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}