import { CardInstance, PlayerHQ, Faction } from '../types/game';

export interface CombatResult {
  updatedBoard: CardInstance[];
  updatedHQs: PlayerHQ[];
  combatLog: string[];
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  winner: Faction | null;
}

export function calculateDamage(attacker: CardInstance, defender: CardInstance): number {
  let effectiveDefense = 0;

  if (defender.type === 'Armor' && attacker.type === 'Infantry') {
    effectiveDefense = Math.floor(defender.defense * 0.5);
  }

  // Heavy Armor ability reduces raw incoming damage by an additional +1
  if (defender.abilities?.includes('HEAVY_ARMOR')) {
    effectiveDefense += 1;
  }

  // Entrenched units take 1 less damage
  if (defender.isEntrenched) {
    effectiveDefense += 1;
  }

  const rawDamage = attacker.attack - effectiveDefense;
  return Math.max(1, rawDamage);
}

export function executeCombatSequence(
  attacker: CardInstance,
  defender: CardInstance,
  board: CardInstance[],
  hqs: PlayerHQ[]
): CombatResult {
  const logs: string[] = [];

  // Suppressed units cannot initiate attacks
  if (attacker.isSuppressed) {
    logs.push(`${attacker.name} is SUPPRESSED and cannot attack!`);
    return { updatedBoard: board, updatedHQs: hqs, combatLog: logs, attackerDestroyed: false, defenderDestroyed: false, winner: null };
  }

  const primaryDamage = calculateDamage(attacker, defender);
  const defenderRemainingHp = defender.currentHp - primaryDamage;
  const defenderDestroyed = defenderRemainingHp <= 0;

  logs.push(`${attacker.name} attacked ${defender.name} for ${primaryDamage} damage.`);

  // Apply Suppression if attacker has SUPPRESSIVE_FIRE ability
  let defenderSuppressed = defender.isSuppressed || false;
  if (!defenderDestroyed && attacker.abilities?.includes('SUPPRESSIVE_FIRE')) {
    defenderSuppressed = true;
    logs.push(`${defender.name} was SUPPRESSED by artillery fire!`);
  }

  let attackerRemainingHp = attacker.currentHp;
  let attackerDestroyed = false;

  if (!defenderDestroyed) {
    const canRetaliate = !(attacker.lane === 'BACKLINE' && defender.lane === 'FRONTLINE') && !defenderSuppressed;
    if (canRetaliate) {
      const retaliationDamage = Math.max(1, Math.floor(calculateDamage(defender, attacker) * 0.5));
      attackerRemainingHp -= retaliationDamage;
      attackerDestroyed = attackerRemainingHp <= 0;
      logs.push(`${defender.name} retaliated against ${attacker.name} for ${retaliationDamage} damage.`);
    } else if (defenderSuppressed) {
      logs.push(`${defender.name} was suppressed and could not retaliate!`);
    } else {
      logs.push(`${defender.name} could not reach ${attacker.name} to retaliate!`);
    }
  } else {
    logs.push(`${defender.name} was destroyed!`);
  }

  let updatedHQs = [...hqs];
  if (defenderDestroyed && attacker.type === 'Armor' && defender.lane === 'FRONTLINE') {
    const excessDamage = Math.abs(defenderRemainingHp);
    if (excessDamage > 0) {
      const enemyFaction = defender.faction;
      updatedHQs = updatedHQs.map(hq => {
        if (hq.faction === enemyFaction) {
          const newHp = Math.max(0, hq.hp - excessDamage);
          logs.push(`Armor Breakthrough! ${excessDamage} damage spilled into ${enemyFaction} HQ!`);
          return { ...hq, hp: newHp };
        }
        return hq;
      });
    }
  }

  let winner: Faction | null = null;
  updatedHQs.forEach(hq => {
    if (hq.hp <= 0) {
      winner = hq.faction === 'USSR' ? 'GERMANY' : 'USSR';
      logs.push(`VICTORY! ${hq.faction} HQ has fallen! ${winner} wins the battle!`);
    }
  });

  const updatedBoard = board
    .map((unit) => {
      if (unit.instanceId === attacker.instanceId) {
        return { ...unit, currentHp: attackerRemainingHp, hasAttacked: true, isEntrenched: false };
      }
      if (unit.instanceId === defender.instanceId) {
        return { ...unit, currentHp: defenderRemainingHp, isSuppressed: defenderSuppressed };
      }
      return unit;
    })
    .filter((unit) => unit.currentHp > 0);

  return { updatedBoard, updatedHQs, combatLog: logs, attackerDestroyed, defenderDestroyed, winner };
}