import { Card, CardInstance, Faction, PlayerHQ } from '../types/game';

export interface CommandResult {
  updatedBoard: CardInstance[];
  updatedHQs: PlayerHQ[];
  combatLog: string[];
}

export function executeCommandCard(
  card: Card,
  targetUnitId: string | null,
  board: CardInstance[],
  hqs: PlayerHQ[],
  activeFaction: Faction
): CommandResult {
  const logs: string[] = [];
  let updatedBoard = [...board];
  let updatedHQs = [...hqs];

  switch (card.commandEffect) {
    case 'AIR_STRIKE': {
      if (!targetUnitId) {
        logs.push('Air Strike failed: No target selected.');
        break;
      }
      updatedBoard = updatedBoard
        .map((unit) => {
          if (unit.instanceId === targetUnitId) {
            const newHp = unit.currentHp - 3;
            logs.push(`Stuka Air Strike hit ${unit.name} for 3 damage!`);
            return { ...unit, currentHp: newHp };
          }
          return unit;
        })
        .filter((unit) => unit.currentHp > 0);
      break;
    }

    case 'GENERAL_WINTER': {
      const enemyFaction: Faction = activeFaction === 'USSR' ? 'GERMANY' : 'USSR';
      updatedBoard = updatedBoard.map((unit) => {
        if (unit.faction === enemyFaction) {
          return { ...unit, isSuppressed: true };
        }
        return unit;
      });
      logs.push(`General Winter descended! All ${enemyFaction} units are SUPPRESSED.`);
      break;
    }

    case 'URRAH_CHARGE': {
      updatedBoard = updatedBoard.map((unit) => {
        if (unit.faction === activeFaction) {
          return { ...unit, attack: unit.attack + 1 };
        }
        return unit;
      });
      logs.push(`Urrah! Charge called! All ${activeFaction} units gained +1 Attack.`);
      break;
    }

    default:
      logs.push(`Executed command: ${card.name}`);
  }

  return { updatedBoard, updatedHQs, combatLog: logs };
}