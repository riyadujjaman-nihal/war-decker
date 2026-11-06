export type Faction = 'USSR' | 'GERMANY';
export type UnitType = 'Infantry' | 'Armor' | 'Artillery';
export type CardType = UnitType | 'Command';
export type Lane = 'FRONTLINE' | 'BACKLINE';
export type GamePhase = 'LOGISTICS' | 'MAIN' | 'COMBAT';
export type UnitAbility = 'ENTRENCHED' | 'HEAVY_ARMOR' | 'SUPPRESSIVE_FIRE';
export type CommandEffect = 'AIR_STRIKE' | 'GENERAL_WINTER' | 'URRAH_CHARGE';

export interface Card {
  id: string;
  name: string;
  faction: Faction;
  cost: number;
  attack: number;
  defense: number;
  type: CardType;
  description?: string;
  abilities?: UnitAbility[];
  commandEffect?: CommandEffect;
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