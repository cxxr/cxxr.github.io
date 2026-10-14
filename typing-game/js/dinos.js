// Catalogue of collectable dino friends (pure data – art lives in dino-art.js).

export const SPECIES_NAMES = {
  trex: 'T-Rex', tricera: 'Triceratops', stego: 'Stegosaurus', bronto: 'Brontosaurus',
  ptero: 'Pterodactyl', ankylo: 'Ankylosaurus', parasaur: 'Parasaurolophus',
};

export const DINOS = [
  { id: 'rexy', name: 'Rexy', species: 'trex', body: '#6fcf7f', belly: '#d9f7c8', accent: '#3f9f55', pronoun: 'she' },
  { id: 'sunny', name: 'Sunny', species: 'trex', body: '#ffd046', belly: '#fff3c2', accent: '#f0a020', pronoun: 'he' },
  { id: 'trixie', name: 'Trixie', species: 'tricera', body: '#ff9f5a', belly: '#ffe2c4', accent: '#e0703a', pronoun: 'she' },
  { id: 'steggy', name: 'Steggy', species: 'stego', body: '#a98bff', belly: '#e6dcff', accent: '#ff8fc8', pronoun: 'he' },
  { id: 'bronty', name: 'Bronty', species: 'bronto', body: '#52c7c7', belly: '#d2f5f2', accent: '#2f9a9a', pronoun: 'she' },
  { id: 'petra', name: 'Petra', species: 'ptero', body: '#ff8cc0', belly: '#ffe0ef', accent: '#e05a98', pronoun: 'she' },
  { id: 'anky', name: 'Anky', species: 'ankylo', body: '#c49a6c', belly: '#f2e2cc', accent: '#8a6440', pronoun: 'he' },
  { id: 'parry', name: 'Parry', species: 'parasaur', body: '#5aa8ff', belly: '#d6eaff', accent: '#ffb347', pronoun: 'he' },
  { id: 'clover', name: 'Clover', species: 'stego', body: '#7ed957', belly: '#e4f9d4', accent: '#ffd23f', pronoun: 'she' },
  { id: 'mango', name: 'Mango', species: 'tricera', body: '#ffb84d', belly: '#fff0d0', accent: '#7ac74f', pronoun: 'he' },
  { id: 'ember', name: 'Ember', species: 'trex', body: '#ff6b5a', belly: '#ffd8c8', accent: '#ffb000', pronoun: 'she' },
  { id: 'dusty', name: 'Dusty', species: 'ankylo', body: '#e3b778', belly: '#fff0d6', accent: '#b5651d', pronoun: 'he' },
  { id: 'frosty', name: 'Frosty', species: 'bronto', body: '#9fd8ff', belly: '#f0faff', accent: '#ffffff', pronoun: 'she' },
  { id: 'zephyr', name: 'Zephyr', species: 'ptero', body: '#ffd700', belly: '#fff7c0', accent: '#ff7eb6', pronoun: 'he' },
];

export const STARTER_DINO = 'rexy';

export function getDino(id) {
  return DINOS.find((d) => d.id === id) || DINOS[0];
}
