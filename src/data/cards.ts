import { Card } from '../types/game';

export const EASTERN_FRONT_CARDS: Card[] = [
  {
    id: 'ussr_conscript',
    name: 'Red Army Squad',
    faction: 'USSR',
    cost: 1,
    attack: 2,
    defense: 3,
    type: 'Infantry',
    description: 'Basic Soviet infantry squad.'
  },
  {
    id: 'ussr_t34',
    name: 'T-34/76 Tank',
    faction: 'USSR',
    cost: 3,
    attack: 4,
    defense: 5,
    type: 'Armor',
    description: 'Rugged medium tank equipped with sloped armor.'
  },
  {
    id: 'ussr_katyusha',
    name: 'Katyusha Rocket',
    faction: 'USSR',
    cost: 4,
    attack: 5,
    defense: 2,
    type: 'Artillery',
    description: 'Devastating indirect rocket barrage.'
  },
  {
    id: 'ger_grenadier',
    name: 'Panzergrenadiers',
    faction: 'GERMANY',
    cost: 2,
    attack: 3,
    defense: 3,
    type: 'Infantry',
    description: 'Mobile mechanized infantry.'
  },
  {
    id: 'ger_panzer_iv',
    name: 'Panzer IV Ausf. H',
    faction: 'GERMANY',
    cost: 3,
    attack: 5,
    defense: 4,
    type: 'Armor',
    description: 'Workhorse tank of the Wehrmacht.'
  },
  {
    id: 'ger_lefh18',
    name: '10.5cm leFH 18',
    faction: 'GERMANY',
    cost: 3,
    attack: 4,
    defense: 3,
    type: 'Artillery',
    description: 'Standard German field howitzer.'
  }
];