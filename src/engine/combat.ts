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
  const primaryDamage = calculateDamage(attacker, defender);
  const defenderRemainingHp = defender.currentHp - primaryDamage;
  const defenderDestroyed = defenderRemainingHp <= 0;

  logs.push(`${attacker.name} attacked ${defender.name} for ${primaryDamage} damage.`);

  let attackerRemainingHp = attacker.currentHp;
  let attackerDestroyed = false;

  if (!defenderDestroyed) {
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

  // Breakthrough Damage: If Armor unit destroys a Frontline unit, excess damage hits enemy HQ
  let updatedHQs = [...hqs];
  if (defenderDestroyed && attacker.type === 'Armor' && defender.lane === 'FRONTLINE') {
    const excessDamage = Math.abs(defenderRemainingHp);
    if (excessDamage > 0) {
      const enemyFaction = defender.faction;
      updatedHQs = updatedHQs.map(hq => {
        if (hq.faction === enemyFaction) {
          const newHp = Math.max(0, hq.hp - excessDamage);
          logs.push(`Armor Breakthrough! ${excessDamage} damage spilled over into ${enemyFaction} HQ!`);
          return { ...hq, hp: newHp };
        }
        return hq;
      });
    }
  }

  // Check Victory Condition
  let winner = null;
  updatedHQs.forEach(hq => {
    if (hq.hp <= 0) {
      winner = hq.faction === 'USSR' ? 'GERMANY' : 'USSR';
      logs.push(`VICTORY! ${hq.faction} HQ has fallen! ${winner} wins the battle!`);
    }
  });

  const updatedBoard = board
    .map((unit) => {
      if (unit.instanceId === attacker.instanceId) {
        return { ...unit, currentHp: attackerRemainingHp, hasAttacked: true };
      }
      if (unit.instanceId === defender.instanceId) {
        return { ...unit, currentHp: defenderRemainingHp };
      }
      return unit;
    })
    .filter((unit) => unit.currentHp > 0);

  return {
    updatedBoard,
    updatedHQs,
    combatLog: logs,
    attackerDestroyed,
    defenderDestroyed,
    winner
  };
}