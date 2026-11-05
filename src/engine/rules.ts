import { CardInstance, Lane, UnitType } from '../types/game';

/**
 * Gets allowed lanes for unit deployment based on UnitType.
 */
export function getAllowedLanes(unitType: UnitType): Lane[] {
  switch (unitType) {
    case 'Infantry':
    case 'Armor':
      return ['FRONTLINE'];
    case 'Artillery':
      return ['BACKLINE', 'FRONTLINE']; // Primary Backline, can move up if desperate
    default:
      return ['FRONTLINE'];
  }
}

/**
 * Checks if a player's Backline is currently protected by Frontline units.
 */
export function isBacklineCovered(board: CardInstance[], defenderFaction: string): boolean {
  return board.some(
    (unit) => unit.faction === defenderFaction && unit.lane === 'FRONTLINE' && unit.currentHp > 0
  );
}

/**
 * Validates whether an attacker can target a specific defender.
 * Returns { valid: true } or { valid: false, reason: string }.
 */
export function validateTargeting(
  attacker: CardInstance,
  defender: CardInstance,
  board: CardInstance[]
): { valid: boolean; reason?: string } {
  // 1. Cannot attack friendly units
  if (attacker.faction === defender.faction) {
    return { valid: false, reason: 'Cannot attack friendly units.' };
  }

  // 2. Attacker must not be exhausted
  if (attacker.hasAttacked) {
    return { valid: false, reason: 'This unit has already acted this turn.' };
  }

  // 3. Artillery ignores Cover rules (Indirect Fire)
  if (attacker.type === 'Artillery') {
    return { valid: true };
  }

  // 4. Non-Artillery targeting a Backline unit must respect Frontline cover
  if (defender.lane === 'BACKLINE') {
    const isCovered = isBacklineCovered(board, defender.faction);
    if (isCovered) {
      return { 
        valid: false, 
        reason: 'Target is protected by Frontline units! Clear the Frontline first or use Artillery.' 
      };
    }
  }

  return { valid: true };
}