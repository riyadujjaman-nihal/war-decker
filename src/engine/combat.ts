import { CardInstance } from '../types/game';

export interface CombatResult {
  updatedBoard: CardInstance[];
  combatLog: string[];
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
}

/**
 * Calculates raw combat damage after armor/defense mitigation.
 * Formula: Max(1, Attacker Attack - Target Defense Modifier)
 */
export function calculateDamage(attacker: CardInstance, defender: CardInstance): number {
  // Armor units receive reduced damage from Infantry unless specialized
  let effectiveDefense = 0;
  
  if (defender.type === 'Armor' && attacker.type === 'Infantry') {
    effectiveDefense = Math.floor(defender.defense * 0.5); // Armor mitigates 50% infantry base damage
  }

  const rawDamage = attacker.attack - effectiveDefense;
  return Math.max(1, rawDamage); // Minimum 1 damage always dealt
}

/**
 * Executes a full combat sequence including retaliation and board state updates.
 */
export function executeCombatSequence(
  attacker: CardInstance,
  defender: CardInstance,
  board: CardInstance[]
): CombatResult {
  const logs: string[] = [];

  // 1. Primary Attack Phase
  const primaryDamage = calculateDamage(attacker, defender);
  const defenderRemainingHp = defender.currentHp - primaryDamage;
  const defenderDestroyed = defenderRemainingHp <= 0;

  logs.push(`${attacker.name} (${attacker.faction}) attacked ${defender.name} for ${primaryDamage} damage.`);

  // 2. Retaliation Phase (Defender counter-attacks if alive and within range)
  let attackerRemainingHp = attacker.currentHp;
  let attackerDestroyed = false;

  if (!defenderDestroyed) {
    // Retaliation check: Artillery cannot be retaliated against by Frontline units
    const canRetaliate = !(attacker.lane === 'BACKLINE' && defender.lane === 'FRONTLINE');

    if (canRetaliate) {
      const retaliationDamage = Math.max(1, Math.floor(calculateDamage(defender, attacker) * 0.5));
      attackerRemainingHp -= retaliationDamage;
      attackerDestroyed = attackerRemainingHp <= 0;

      logs.push(`${defender.name} retaliated against ${attacker.name} for ${retaliationDamage} damage.`);
    } else {
      logs.push(`${defender.name} could not reach ${attacker.name} to retaliate!`);
    }
  } else {
    logs.push(`${defender.name} was destroyed!`);
  }

  if (attackerDestroyed) {
    logs.push(`${attacker.name} was destroyed in counter-attack!`);
  }

  // 3. Update Board State
  const updatedBoard = board
    .map((unit) => {
      if (unit.instanceId === attacker.instanceId) {
        return {
          ...unit,
          currentHp: attackerRemainingHp,
          hasAttacked: true
        };
      }
      if (unit.instanceId === defender.instanceId) {
        return {
          ...unit,
          currentHp: defenderRemainingHp
        };
      }
      return unit;
    })
    .filter((unit) => unit.currentHp > 0); // Clear defeated units

  return {
    updatedBoard,
    combatLog: logs,
    attackerDestroyed,
    defenderDestroyed
  };
};
