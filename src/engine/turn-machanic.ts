import { CardInstance, Faction, GamePhase, PlayerState } from '../types/game';
import { USSR_STARTER_DECK, GERMANY_STARTER_DECK } from '../data/cards';

export interface TurnState {
  turnNumber: number;
  activePlayer: Faction;
  phase: GamePhase;
  players: Record<Faction, PlayerState>;
}

const MAX_SUPPLY_CAP = 10;
const HAND_LIMIT = 6;

/** Helper to draw cards from a deck */
export function drawCards(player: PlayerState, amount: number): PlayerState {
  const newDeck = [...player.deck];
  const newHand = [...player.hand];
  const newGraveyard = [...player.graveyard];

  for (let i = 0; i < amount; i++) {
    if (newDeck.length === 0) break;
    const drawnCard = newDeck.shift()!;
    if (newHand.length < HAND_LIMIT) {
      newHand.push(drawnCard);
    } else {
      newGraveyard.push(drawnCard); // Discard overdrawn cards
    }
  }

  return { ...player, deck: newDeck, hand: newHand, graveyard: newGraveyard };
}

export function createInitialTurnState(): TurnState {
  // Initialize and draw starting hand (3 cards each)
  const ussrInitial = drawCards({
    faction: 'USSR',
    currentSupply: 1,
    maxSupply: 1,
    deck: [...USSR_STARTER_DECK],
    hand: [],
    graveyard: []
  }, 3);

  const gerInitial = drawCards({
    faction: 'GERMANY',
    currentSupply: 1,
    maxSupply: 1,
    deck: [...GERMANY_STARTER_DECK],
    hand: [],
    graveyard: []
  }, 3);

  return {
    turnNumber: 1,
    activePlayer: 'USSR',
    phase: 'LOGISTICS',
    players: {
      USSR: ussrInitial,
      GERMANY: gerInitial
    }
  };
}

export function advanceTurn(
  currentState: TurnState,
  board: CardInstance[]
): { nextTurnState: TurnState; updatedBoard: CardInstance[] } {
  const nextPlayer: Faction = currentState.activePlayer === 'USSR' ? 'GERMANY' : 'USSR';
  const newTurnNumber = nextPlayer === 'USSR' ? currentState.turnNumber + 1 : currentState.turnNumber;

  // Refill supply & draw 1 card for the active player
  const rawNextPlayerState = currentState.players[nextPlayer];
  const newMaxSupply = Math.min(MAX_SUPPLY_CAP, rawNextPlayerState.maxSupply + 1);

  const suppliedState: PlayerState = {
    ...rawNextPlayerState,
    maxSupply: newMaxSupply,
    currentSupply: newMaxSupply
  };

  const updatedNextPlayerState = drawCards(suppliedState, 1);

  const updatedPlayers = {
    ...currentState.players,
    [nextPlayer]: updatedNextPlayerState
  };

  const updatedBoard = board.map((unit) => {
  if (unit.faction === nextPlayer) {
    return {
      ...unit,
      hasAttacked: false,
      isSuppressed: false, // Clear suppression at start of player's turn
      isEntrenched: unit.abilities?.includes('ENTRENCHED') ? true : unit.isEntrenched
    };
  }
  return unit;
});

  return {
    nextTurnState: {
      turnNumber: newTurnNumber,
      activePlayer: nextPlayer,
      phase: 'MAIN',
      players: updatedPlayers
    },
    updatedBoard
  };
}