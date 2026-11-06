export type Faction = 'USSR' | 'GERMANY';
export type UnitType = 'Infantry' | 'Armor' | 'Artillery';
export type Lane = 'FRONTLINE' | 'BACKLINE';
export type GamePhase = 'LOGISTICS' | 'MAIN' | 'COMBAT';
export type UnitAbility = 'ENTRENCHED' | 'HEAVY_ARMOR' | 'SUPPRESSIVE_FIRE';
export interface Card {
  id: string;
  name: string;
  faction: Faction;
  cost: number;
  attack: number;
  defense: number;
  type: UnitType;
  description?: string;
  abilities?: UnitAbility[];
}

export interface CardInstance extends Card {
  instanceId: string;
  currentHp: number;
  hasAttacked: boolean;
  isSuppressed?: boolean;
  isEntrenched?: boolean;
  lane: Lane;
}
// Add to src/types/game.ts
export interface PlayerHQ {
  faction: Faction;
  hp: number;
}
export interface PlayerState {
  faction: Faction;
  currentSupply: number;
  maxSupply: number;
  deck: Card[];
  hand: Card[];
  graveyard: Card[];
}