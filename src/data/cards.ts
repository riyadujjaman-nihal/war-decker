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
export const USSR_STARTER_DECK: Card[] = [
  { id: 'ussr_cons_1', name: 'Conscript Riflemen', faction: 'USSR', cost: 1, attack: 2, defense: 2, type: 'Infantry', abilities: ['ENTRENCHED'] },
  { id: 'ussr_cons_2', name: 'Conscript Riflemen', faction: 'USSR', cost: 1, attack: 2, defense: 2, type: 'Infantry', abilities: ['ENTRENCHED'] },
  { id: 'ussr_guard_1', name: 'Guards Rifle Battalion', faction: 'USSR', cost: 2, attack: 3, defense: 4, type: 'Infantry' },
  { id: 'ussr_t34_1', name: 'T-34/76 Tank', faction: 'USSR', cost: 3, attack: 4, defense: 5, type: 'Armor' },
  { id: 'ussr_t34_2', name: 'T-34/76 Tank', faction: 'USSR', cost: 3, attack: 4, defense: 5, type: 'Armor' },
  { id: 'ussr_kv1', name: 'KV-1 Heavy Tank', faction: 'USSR', cost: 5, attack: 6, defense: 7, type: 'Armor', abilities: ['HEAVY_ARMOR'] },
  { id: 'ussr_katyusha_1', name: 'Katyusha Rocket Battery', faction: 'USSR', cost: 4, attack: 5, defense: 2, type: 'Artillery', abilities: ['SUPPRESSIVE_FIRE'] },
];

export const GERMANY_STARTER_DECK: Card[] = [
  { id: 'ger_gren_1', name: 'Wehrmacht Infantry', faction: 'GERMANY', cost: 1, attack: 2, defense: 3, type: 'Infantry', abilities: ['ENTRENCHED'] },
  { id: 'ger_gren_2', name: 'Panzergrenadiers', faction: 'GERMANY', cost: 2, attack: 3, defense: 3, type: 'Infantry' },
  { id: 'ger_p4_1', name: 'Panzer IV Ausf. H', faction: 'GERMANY', cost: 3, attack: 5, defense: 4, type: 'Armor' },
  { id: 'ger_p4_2', name: 'Panzer IV Ausf. H', faction: 'GERMANY', cost: 3, attack: 5, defense: 4, type: 'Armor' },
  { id: 'ger_tiger', name: 'Tiger I Heavy Tank', faction: 'GERMANY', cost: 6, attack: 7, defense: 7, type: 'Armor', abilities: ['HEAVY_ARMOR'] },
  { id: 'ger_art_1', name: '10.5cm leFH 18 Field Gun', faction: 'GERMANY', cost: 3, attack: 4, defense: 3, type: 'Artillery', abilities: ['SUPPRESSIVE_FIRE'] },
];