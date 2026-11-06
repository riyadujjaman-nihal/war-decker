import { useState } from 'react';
import { Card, CardInstance, Faction, Lane, PlayerHQ } from './types/game';
import { createInitialTurnState, advanceTurn } from './engine/turn-machanic';
import { validateTargeting, getAllowedLanes } from './engine/rules';
import { executeCombatSequence } from './engine/combat';
import { CardItem } from './components/Carditem';
import { UnitUnit } from './components/Unit';

export default function App() {
  const [turnState, setTurnState] = useState(createInitialTurnState());
  const [board, setBoard] = useState<CardInstance[]>([]);
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [hqs, setHqs] = useState<PlayerHQ[]>([
    { faction: 'USSR', hp: 20 },
    { faction: 'GERMANY', hp: 20 }
  ]);
  const [winner, setWinner] = useState<Faction | null>(null);

  const activeFaction = turnState.activePlayer;
  const activePlayerState = turnState.players[activeFaction];
  const activeHand = activePlayerState.hand;

  const playCardToLane = (card: Card, index: number, targetLane: Lane) => {
    if (winner) return;

    if (activePlayerState.currentSupply < card.cost) {
      alert("Not enough Supply Points!");
      return;
    }

    const allowedLanes = getAllowedLanes(card.type);
    if (!allowedLanes.includes(targetLane)) {
      alert(`${card.type} units cannot be deployed to the ${targetLane}!`);
      return;
    }

    // Remove card from player's hand and deduct supply
    const newHand = activeHand.filter((_, i) => i !== index);
    setTurnState({
      ...turnState,
      players: {
        ...turnState.players,
        [activeFaction]: {
          ...activePlayerState,
          currentSupply: activePlayerState.currentSupply - card.cost,
          hand: newHand
        }
      }
    });

    const newUnit: CardInstance = {
      ...card,
      instanceId: Math.random().toString(),
      currentHp: card.defense,
      hasAttacked: false,
      lane: targetLane
    };
    setBoard([...board, newUnit]);
  };

  const handleUnitClick = (targetUnit: CardInstance) => {
    if (winner) return;
    if (targetUnit.faction === activeFaction) {
      if (targetUnit.hasAttacked) return;
      setSelectedAttackerId(targetUnit.instanceId === selectedAttackerId ? null : targetUnit.instanceId);
      return;
    }

    if (selectedAttackerId && targetUnit.faction !== activeFaction) {
      const attacker = board.find((u) => u.instanceId === selectedAttackerId);
      if (!attacker) return;

      const validation = validateTargeting(attacker, targetUnit, board);
      if (!validation.valid) {
        alert(validation.reason);
        return;
      }

      const result = executeCombatSequence(attacker, targetUnit, board, hqs);
      setBoard(result.updatedBoard);
      setHqs(result.updatedHQs);
      setCombatLogs((prev) => [...result.combatLog, ...prev.slice(0, 4)]);
      setSelectedAttackerId(null);

      if (result.winner) {
        setWinner(result.winner);
      }
    }
  };

  const handleEndTurn = () => {
    if (winner) return;
    const { nextTurnState, updatedBoard } = advanceTurn(turnState, board);
    setTurnState(nextTurnState);
    setBoard(updatedBoard);
    setSelectedAttackerId(null);
  };

  const ussrHqHp = hqs.find(h => h.faction === 'USSR')?.hp ?? 20;
  const gerHqHp = hqs.find(h => h.faction === 'GERMANY')?.hp ?? 20;

  const gerBackline = board.filter(u => u.faction === 'GERMANY' && u.lane === 'BACKLINE');
  const gerFrontline = board.filter(u => u.faction === 'GERMANY' && u.lane === 'FRONTLINE');
  const ussrFrontline = board.filter(u => u.faction === 'USSR' && u.lane === 'FRONTLINE');
  const ussrBackline = board.filter(u => u.faction === 'USSR' && u.lane === 'BACKLINE');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#121212', color: '#fff', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>WW2 Eastern Front: Command</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>
            Turn {turnState.turnNumber} | Active Turn: <span style={{ color: activeFaction === 'USSR' ? '#ff4d4d' : '#4da6ff', fontWeight: 'bold' }}>{activeFaction}</span>
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '13px' }}>
            <span style={{ color: '#ff7675' }}>USSR HQ HP: <strong>{ussrHqHp}/20</strong> | Deck: {turnState.players.USSR.deck.length}</span>
            <span style={{ color: '#74b9ff' }}>GERMANY HQ HP: <strong>{gerHqHp}/20</strong> | Deck: {turnState.players.GERMANY.deck.length}</span>
          </div>
        </div>

        <div style={{ background: '#1e1e1e', padding: '10px 15px', borderRadius: '6px', border: '1px solid #333' }}>
          <div>Supply: <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{activePlayerState.currentSupply} / {activePlayerState.maxSupply} SP</span></div>
          <button 
            onClick={handleEndTurn}
            disabled={!!winner}
            style={{ marginTop: '8px', padding: '6px 12px', background: winner ? '#555' : '#e67e22', color: '#fff', border: 'none', cursor: winner ? 'not-allowed' : 'pointer', borderRadius: '4px', fontWeight: 'bold', width: '100%' }}
          >
            End Turn
          </button>
        </div>
      </header>

      {winner && (
        <div style={{ background: '#27ae60', padding: '15px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
          🏆 {winner} WINS THE BATTLE! COMMAND HQ SECURED.
        </div>
      )}

      {/* 4-LANE BATTLEFIELD GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
        <div style={{ background: '#221a1a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #4da6ff' }}>
          <div style={{ fontSize: '12px', color: '#74b9ff', fontWeight: 'bold', marginBottom: '8px' }}>GERMAN BACKLINE</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {gerBackline.length === 0 && <span style={{ color: '#666', fontSize: '13px' }}>No units</span>}
            {gerBackline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#26221a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #f39c12' }}>
          <div style={{ fontSize: '12px', color: '#f1c40f', fontWeight: 'bold', marginBottom: '8px' }}>GERMAN FRONTLINE</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {gerFrontline.length === 0 && <span style={{ color: '#666', fontSize: '13px' }}>No units</span>}
            {gerFrontline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

        <hr style={{ borderColor: '#444', margin: '5px 0' }} />

        <div style={{ background: '#221e1a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #e74c3c' }}>
          <div style={{ fontSize: '12px', color: '#ff7675', fontWeight: 'bold', marginBottom: '8px' }}>SOVIET FRONTLINE</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {ussrFrontline.length === 0 && <span style={{ color: '#666', fontSize: '13px' }}>No units</span>}
            {ussrFrontline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#1a221a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #2ecc71' }}>
          <div style={{ fontSize: '12px', color: '#55efc4', fontWeight: 'bold', marginBottom: '8px' }}>SOVIET BACKLINE</div>
          <div style={{ display: 'flex', gap: '10px', minHeight: '90px', alignItems: 'center' }}>
            {ussrBackline.length === 0 && <span style={{ color: '#666', fontSize: '13px' }}>No units</span>}
            {ussrBackline.map(unit => (
              <div key={unit.instanceId} onClick={() => handleUnitClick(unit)}>
                <UnitUnit unit={unit} activeTurn={activeFaction} isSelected={unit.instanceId === selectedAttackerId} selectedAttackerId={selectedAttackerId} onSelect={() => {}} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOGS & HAND */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>Combat Log</h3>
          <div style={{ fontSize: '12px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {combatLogs.length === 0 && <em>No actions recorded yet.</em>}
            {combatLogs.map((log, i) => <div key={i}>• {log}</div>)}
          </div>
        </div>

        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>{activeFaction}'s Hand ({activeHand.length}/6)</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {activeHand.map((card, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <CardItem card={card} activeTurn={activeFaction} onPlay={() => {}} />
                {!winner && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => playCardToLane(card, index, 'FRONTLINE')}
                      style={{ fontSize: '10px', padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Front
                    </button>
                    <button 
                      onClick={() => playCardToLane(card, index, 'BACKLINE')}
                      style={{ fontSize: '10px', padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Back
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