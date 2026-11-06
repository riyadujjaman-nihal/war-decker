import { CardInstance, Faction, GamePhase } from '../types/game';

export interface PlayerState {
  faction: Faction;
  currentSupply: number;
  maxSupply: number;
}

export interface TurnState {
  turnNumber: number;
  activePlayer: Faction;
  phase: GamePhase;
  players: Record<Faction, PlayerState>;
}

const MAX_SUPPLY_CAP = 10;

/**
 * Initializes default starting turn state for USSR vs GERMANY.
 */
export function createInitialTurnState(): TurnState {
  return {
    turnNumber: 1,
    activePlayer: 'USSR',
    phase: 'LOGISTICS',
    players: {
      USSR: { faction: 'USSR', currentSupply: 1, maxSupply: 1 },
      GERMANY: { faction: 'GERMANY', currentSupply: 1, maxSupply: 1 }
    }
  };
}

/**
 * Handles transitioning to the next player's turn:
 * 1. Flips active player
 * 2. Increments max supply (up to cap) and fully refills supply points
 * 3. Resets attack exhaustion on active player's units
 */
export function advanceTurn(
  currentState: TurnState,
  board: CardInstance[]
): { nextTurnState: TurnState; updatedBoard: CardInstance[] } {
  const nextPlayer: Faction = currentState.activePlayer === 'USSR' ? 'GERMANY' : 'USSR';
  const newTurnNumber = nextPlayer === 'USSR' ? currentState.turnNumber + 1 : currentState.turnNumber;

  const activePlayerState = currentState.players[nextPlayer];
  const newMaxSupply = Math.min(MAX_SUPPLY_CAP, activePlayerState.maxSupply + 1);

  const updatedPlayers = {
    ...currentState.players,
    [nextPlayer]: {
      ...activePlayerState,
      maxSupply: newMaxSupply,
      currentSupply: newMaxSupply
    }
  };

  // Reset attack status for units belonging to the new active player
  const updatedBoard = board.map((unit) => {
    if (unit.faction === nextPlayer) {
      return { ...unit, hasAttacked: false };
    }
    return unit;
  });

  const nextTurnState: TurnState = {
    turnNumber: newTurnNumber,
    activePlayer: nextPlayer,
    phase: 'MAIN',
    players: updatedPlayers
  };

  return { nextTurnState, updatedBoard };
}