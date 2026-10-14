/* Dino Keys – Touch Typing Game (Browser Bundle) */
(function() {
  "use strict";

  var modules = {};

  function define(id, factory) {
    modules[id] = { factory: factory, exports: {}, loaded: false };
  }

  function require(id) {
    var key = id.replace(/^\.\//, '').replace(/\.js$/, '');
    var mod = modules[key];
    if (!mod) {
      throw new Error("Module not found: " + id);
    }
    if (!mod.loaded) {
      mod.loaded = true;
      mod.factory(mod.exports, require);
    }
    return mod.exports;
  }

  /* === Module: words.js === */
  define("words", function(exports, require) {
// Word & sentence banks. Lessons filter these down to words that only use the
// keys a child has learned so far, so the lists deliberately include lots of
// words that can be made from just the home row, then home + top row, etc.

const WORDS = `
a as ad add ads all ask asks dad dads fad fads fall falls flag flags flask gas glad
had half hall halls has lad lads lag lash sad salad salsa sash shall dash flash glass
gala saga alfalfa ash hash alas slash haha

see seed seeds feed fed led sled sea else side slide slid lid kid kids hid hide dig digs
file fig figs like lake hike idea ideas egg eggs leaf deal sell shell she he his is if
did feel fish dish kiss giggle jiggle field shield ski skies lie safe sale sail said
life ease easel fiddle half

red ride rides fur sure rug rugs hug hugs jug dug fire hire her here hear rule rules
real read ruler rake ear ears far jar dark hard shark sugar sir use fudge judge
sludge large dear deer fear gear hula surf rides fries lurk

the at it tail tails tree trees try yes yay they trail rest test fast first day days
say stay hay tea eat sit tiger dusty tasty ready story yell yuck yard year kitty sky
fly fist gift tusk tusks dirty turtle star stars feast treat treats jelly silly
fluffy heart yet that this these teeth sticky fruit

wow who work roar roars food foot door water wet sweet toy toys joy frog frogs goose
show slow grow flower tower horse house dog dogs hot lot got go so do to too two of
for your you our out what with will would word words world yellow follow owl owls
low glow toad road rooster tooth fossil fossils yolk fog hello forest lost dodo
good look looks floor fold gold

quiet quick quest queen paw paws pop hop top stop shop pool play plays puppy happy
sleepy apple pie pig pet purple soup super jeep sheep ship dip flip flop people
squeak squid quake quilt equal spot spots step steps proud tropical

move very love five have give save dive vet visit mom my me am mud map jump jumps
stomp swamp meteor dream warm time milk smile small mammoth lava movie mommy memory
hum drum

dino dinos dinosaur nest bone bones baby big bug bugs banana run fun sun no not and
in on brown brave nine ten seven eleven bumpy bounce rainbow jungle bubble button
begin rabbit bird birds brain giant tiny funny honey bunny noon moon running

can cat cave claw claws comet crunch munch much such each catch chomp chick cookie
cub cute volcano pancake cactus carrot rock back black duck clock click cloud clouds
crab ice nice

box fox six mix wax ox taxi next extra exit relax rex

zoo zip zap zoom zebra zero buzz fizz pizza lazy crazy fuzzy dizzy zigzag puzzle
breeze sneeze frozen squeeze
`.split(/\s+/).filter(Boolean);

const NAMES = [
  'Rex', 'Tops', 'Spike', 'Pip', 'Zara', 'Bruno', 'Luna', 'Max', 'Ivy', 'Otto', 'Rexy', 'Trixie',
  'Steggy', 'Petra', 'Bronty', 'Anky', 'Parry', 'Mia', 'Leo', 'Sam', 'Ava', 'Ben', 'Kai', 'Zoe',
];

const SENTENCES = [
  'I see a dino.', 'The egg is big.', 'Rex can run fast.', 'We like to play.', 'The sun is hot.',
  'A baby dino hatched.', 'Look at the big egg.', 'Dinos stomp and roar.', 'I can type with all my fingers.',
  'The volcano is very tall.', 'We ate a big salad.', 'The ferns are green.', 'My dino likes to dance.',
  'Tops has three horns.', 'Pip is a tiny dino.', 'The jungle is full of bugs.', 'Let us go to the lake.',
  'The moon is up in the sky.', 'A comet zooms by.', 'I hug my dino friend.', 'Spike has spikes on his tail.',
  'Ivy hid the egg in the nest.', 'The dino had a fun day.', 'She sat on a rock.', 'He ate red fruit.',
];

const QUESTIONS = [
  'Can you see the dino?', 'Where is the egg?', 'Who said roar?', 'Wow, that is a big dino!',
  'Look out!', 'Is it time to eat?', 'What a great day!', 'Do dinos like cake?', 'Yay, we did it!',
  'Did the egg hatch?', 'How tall is the volcano?', 'Stomp, stomp, stomp!',
];

const APOSTROPHES = [
  "It's a dino!", "Don't wake the baby.", "I can't find my egg.", "Rex's tail is long.",
  "Let's play a game.", "That's a big bone.", "We're going to the lake.", "She's a fast runner.",
  "Where's the nest?", "I'm a happy dino.",
];

const NUMBER_SENTENCES = [
  'I see 3 eggs.', 'There are 5 dinos.', 'Rex ate 10 leaves.', 'We found 2 bones.', 'It is 7 feet tall.',
  'My dino is 4 years old.', 'The nest has 6 eggs.', 'Count to 9.', 'Tops ate 8 ferns.', '1 2 3 go!',
  'The volcano is 1200 feet tall.', 'We hiked 15 miles.',
];

const FACTS = [
  'Some dinosaurs were as small as chickens.',
  'Triceratops had three horns on its face.',
  'Stegosaurus had big plates along its back.',
  'Brontosaurus had a very long neck and a long tail.',
  'Pterosaurs could fly, but they were not dinosaurs.',
  'Ankylosaurus had a heavy club at the end of its tail.',
  'Tyrannosaurus rex had tiny arms but very strong jaws.',
  'Dinosaurs hatched from eggs, just like birds do today.',
  'Birds are living relatives of the dinosaurs.',
  'Scientists who study fossils are called paleontologists.',
  'Some dinosaurs ate plants and some ate meat.',
  'Many dinosaurs had feathers to keep them warm.',
  'Parasaurolophus had a long crest on its head that may have made sounds.',
  'Dinosaurs lived on Earth for more than one hundred and fifty million years.',
  'Fossils help us learn how dinosaurs lived and what they ate.',
  'The word dinosaur means terrible lizard.',
  'Velociraptor was about the size of a turkey.',
  'Some long necked dinosaurs were longer than a school bus.',
  'Dinosaur footprints can still be found in rocks today.',
  'A huge asteroid hit the Earth about 66 million years ago.',
  'The quick brown fox jumps over the lazy dog.',
  'Jackdaws love my big sphinx of quartz.',
  'How vexingly quick daft zebras jump!',
  'The five boxing wizards jump quickly.',
];

    Object.assign(exports, { WORDS, NAMES, SENTENCES, QUESTIONS, APOSTROPHES, NUMBER_SENTENCES, FACTS });
  });

  /* === Module: dinos.js === */
  define("dinos", function(exports, require) {
// Catalogue of collectable dino friends (pure data – art lives in dino-art.js).

const SPECIES_NAMES = {
  trex: 'T-Rex', tricera: 'Triceratops', stego: 'Stegosaurus', bronto: 'Brontosaurus',
  ptero: 'Pterodactyl', ankylo: 'Ankylosaurus', parasaur: 'Parasaurolophus',
};

const DINOS = [
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

const STARTER_DINO = 'rexy';

function getDino(id) {
  return DINOS.find((d) => d.id === id) || DINOS[0];
}

    Object.assign(exports, { SPECIES_NAMES, DINOS, STARTER_DINO, getDino });
  });

  /* === Module: layout.js === */
  define("layout", function(exports, require) {
// Keyboard layout (US QWERTY) and touch-typing finger assignments.
// Pure data + helpers so it can be unit tested in node.

/** Finger ids, left pinky → right pinky, plus thumbs. */
const FINGERS = ['L5', 'L4', 'L3', 'L2', 'TH', 'R2', 'R3', 'R4', 'R5'];

const FINGER_NAMES = {
  L5: 'left pinky', L4: 'left ring finger', L3: 'left middle finger', L2: 'left pointer finger',
  TH: 'thumb',
  R2: 'right pointer finger', R3: 'right middle finger', R4: 'right ring finger', R5: 'right pinky',
};

/** CSS variable used for each finger's colour. */
const FINGER_COLOR_VAR = {
  L5: '--f-pinky', L4: '--f-ring', L3: '--f-middle', L2: '--f-index-l', TH: '--f-thumb',
  R2: '--f-index-r', R3: '--f-middle', R4: '--f-ring', R5: '--f-pinky',
};

/**
 * Rows of the on-screen keyboard. Each key: [id, label, finger, widthUnits].
 * `id` is the unshifted character for printable keys, or a name for special keys.
 */
const ROWS = [
  [['`', '`', 'L5'], ['1', '1', 'L5'], ['2', '2', 'L4'], ['3', '3', 'L3'], ['4', '4', 'L2'], ['5', '5', 'L2'],
   ['6', '6', 'R2'], ['7', '7', 'R2'], ['8', '8', 'R3'], ['9', '9', 'R4'], ['0', '0', 'R5'], ['-', '-', 'R5'],
   ['=', '=', 'R5'], ['Backspace', '⌫', 'R5', 1.6]],
  [['Tab', 'tab', 'L5', 1.5], ['q', 'Q', 'L5'], ['w', 'W', 'L4'], ['e', 'E', 'L3'], ['r', 'R', 'L2'], ['t', 'T', 'L2'],
   ['y', 'Y', 'R2'], ['u', 'U', 'R2'], ['i', 'I', 'R3'], ['o', 'O', 'R4'], ['p', 'P', 'R5'], ['[', '[', 'R5'],
   [']', ']', 'R5'], ['\\', '\\', 'R5', 1.1]],
  [['CapsLock', 'caps', 'L5', 1.8], ['a', 'A', 'L5'], ['s', 'S', 'L4'], ['d', 'D', 'L3'], ['f', 'F', 'L2'], ['g', 'G', 'L2'],
   ['h', 'H', 'R2'], ['j', 'J', 'R2'], ['k', 'K', 'R3'], ['l', 'L', 'R4'], [';', ';', 'R5'], ["'", "'", 'R5'],
   ['Enter', 'enter', 'R5', 1.8]],
  [['ShiftLeft', 'shift', 'L5', 2.3], ['z', 'Z', 'L5'], ['x', 'X', 'L4'], ['c', 'C', 'L3'], ['v', 'V', 'L2'], ['b', 'B', 'L2'],
   ['n', 'N', 'R2'], ['m', 'M', 'R2'], [',', ',', 'R3'], ['.', '.', 'R4'], ['/', '/', 'R5'],
   ['ShiftRight', 'shift', 'R5', 2.3]],
  [[' ', 'space', 'TH', 6.5]],
];

const HOME_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

/** Shifted characters → the unshifted key that produces them. */
const SHIFTED = {
  '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
};

const FINGER_OF = {};
for (const row of ROWS) for (const [id, , finger] of row) FINGER_OF[id] = finger;

/**
 * Describe how to type a character.
 * @returns {{key: string, finger: string, shift: null|'ShiftLeft'|'ShiftRight'} | null}
 */
function keyFor(ch) {
  if (ch == null) return null;
  let key = ch;
  let shifted = false;
  if (/^[A-Z]$/.test(ch)) { key = ch.toLowerCase(); shifted = true; }
  else if (SHIFTED[ch]) { key = SHIFTED[ch]; shifted = true; }
  const finger = FINGER_OF[key];
  if (!finger) return null;
  let shift = null;
  // Touch typists use the Shift key on the *opposite* hand.
  if (shifted) shift = finger.startsWith('L') ? 'ShiftRight' : 'ShiftLeft';
  return { key, finger, shift };
}

function fingerFor(ch) {
  const k = keyFor(ch);
  return k ? k.finger : null;
}

/** True when `ch` needs a Shift key. */
function needsShift(ch) {
  const k = keyFor(ch);
  return !!(k && k.shift);
}

const SPOKEN = {
  ' ': 'space bar', ';': 'semicolon', "'": 'apostrophe', ',': 'comma', '.': 'period', '/': 'slash',
  '?': 'question mark', '!': 'exclamation mark', '-': 'dash', '=': 'equals', ':': 'colon', '"': 'quote',
  '`': 'backtick', '[': 'left bracket', ']': 'right bracket', '\\': 'backslash', a: 'ay',
};

/** Friendly spoken name of a key (used for speech synthesis prompts). */
function spokenName(ch) {
  if (SPOKEN[ch]) return SPOKEN[ch];
  if (/^[A-Z]$/.test(ch)) return `capital ${ch === 'A' ? 'ay' : ch}`;
  if (/^[a-z]$/.test(ch)) return ch.toUpperCase();
  return ch;
}

/** Label shown on a big key cap (what is printed on a physical keyboard). */
function capLabel(ch) {
  if (ch === ' ') return 'space';
  if (/^[a-z]$/.test(ch)) return ch.toUpperCase();
  return ch;
}

/** A short "use your ___" hint for a character, including shift guidance. */
function fingerHint(ch) {
  const k = keyFor(ch);
  if (!k) return '';
  let text = `Use your ${FINGER_NAMES[k.finger]}`;
  if (k.finger === 'TH') text = 'Tap the space bar with your thumb';
  if (k.shift) {
    const shiftFinger = k.shift === 'ShiftLeft' ? 'left pinky' : 'right pinky';
    text += ` + hold Shift with your ${shiftFinger}`;
  }
  return text;
}

    Object.assign(exports, { FINGERS, FINGER_NAMES, FINGER_COLOR_VAR, ROWS, HOME_KEYS, SHIFTED, keyFor, fingerFor, needsShift, spokenName, capLabel, fingerHint });
  });

  /* === Module: dino-art.js === */
  define("dino-art", function(exports, require) {
// Hand-built SVG art: cute side-view dinos (one parametric body, species-specific
// features) and hatching eggs. Animation is done in CSS via the class names here.
const { getDino } = require("dinos");

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour. */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  const r = f(n >> 16); const g = f((n >> 8) & 255); const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const INK = '#2b3a4a';

function headSVG(d, c) {
  const { body, belly, accent } = c;
  const sp = d.species;
  let features = '';
  let behind = '';
  if (sp === 'tricera') {
    behind = `<circle cx="122" cy="50" r="34" fill="${accent}"/><circle cx="122" cy="50" r="25" fill="${shade(accent, 0.35)}"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = (-150 + i * 30) * Math.PI / 180; return `<circle cx="${122 + Math.cos(a) * 34}" cy="${50 + Math.sin(a) * 34}" r="5" fill="${accent}"/>`; }).join('')}`;
    features = `<path d="M136 36 L150 8 L148 38 Z" fill="#fff4dc" stroke="${shade(accent, -0.2)}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M172 58 L184 40 L180 62 Z" fill="#fff4dc" stroke="${shade(accent, -0.2)}" stroke-width="2" stroke-linejoin="round"/>`;
  } else if (sp === 'parasaur') {
    behind = `<path d="M128 40 C 104 14, 76 10, 64 18 C 76 28, 100 40, 122 58 Z" fill="${accent}" stroke="${shade(accent, -0.15)}" stroke-width="2"/>`;
  } else if (sp === 'ptero') {
    behind = `<path d="M124 42 L84 22 L118 60 Z" fill="${accent}"/>`;
  }
  const snout = sp === 'ptero'
    ? `<path d="M156 58 Q 196 64 199 72 Q 180 82 156 82 Z" fill="#ffc94d" stroke="#e0a020" stroke-width="2" stroke-linejoin="round"/>`
    : `<ellipse cx="160" cy="70" rx="24" ry="17" fill="${body}"/>`;
  return `
    ${behind}
    <ellipse cx="138" cy="58" rx="33" ry="29" fill="${body}"/>
    ${snout}
    <ellipse cx="128" cy="78" rx="16" ry="8" fill="${belly}" opacity=".7"/>
    ${features}
    <g class="d-eye">
      <ellipse cx="143" cy="50" rx="10" ry="11" fill="#fff"/>
      <circle class="d-pupil" cx="146" cy="51" r="6" fill="${INK}"/>
      <circle cx="148" cy="48" r="2.2" fill="#fff"/>
    </g>
    <ellipse cx="157" cy="73" rx="7" ry="4.5" fill="#ff8fab" opacity=".55"/>
    ${sp === 'ptero' ? '' : `<circle cx="178" cy="64" r="1.8" fill="${INK}"/>`}
    <path class="d-mouth-smile" d="${sp === 'ptero' ? 'M160 74 Q 176 80 190 74' : 'M152 79 Q 165 88 178 77'}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="d-mouth-open" d="M150 77 Q 166 98 180 76 Z" fill="#c2405a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
}

/**
 * SVG markup for a dino.
 * @param {string|object} dinoOrId  catalogue id or entry
 * @param {{className?: string}} opts
 */
function dinoSVG(dinoOrId, { className = '' } = {}) {
  const d = typeof dinoOrId === 'string' ? getDino(dinoOrId) : dinoOrId;
  const body = d.body; const belly = d.belly; const accent = d.accent;
  const dark = shade(body, -0.18);
  const sp = d.species;
  const c = { body, belly, accent };

  let back = '';   // drawn behind the body
  let front = '';  // drawn over the body
  let tail = `<path d="M60 90 C 34 88, 14 98, 2 120 C 22 118, 42 120, 64 120 Z" fill="${body}"/>`;

  if (sp === 'stego') {
    back = [[52, 82, 13], [68, 68, 16], [88, 62, 17], [108, 66, 15], [124, 76, 11]]
      .map(([x, y, s]) => `<path d="M${x - s * 0.7} ${y + s * 0.6} L${x} ${y - s} L${x + s * 0.7} ${y + s * 0.6} Z" fill="${accent}" stroke="${shade(accent, -0.2)}" stroke-width="2" stroke-linejoin="round"/>`).join('');
    tail += `<path d="M8 112 L2 96 L16 110 Z M20 110 L16 94 L28 108 Z" fill="${accent}"/>`;
  } else if (sp === 'ankylo') {
    back = `<path d="M48 100 C 52 62, 132 58, 136 100 Z" fill="${accent}"/>` +
      [[58, 80], [74, 68], [92, 64], [110, 68], [126, 80]].map(([x, y]) => `<path d="M${x - 6} ${y + 4} L${x} ${y - 9} L${x + 6} ${y + 4} Z" fill="${shade(accent, 0.3)}"/>`).join('');
    tail += `<circle cx="8" cy="116" r="12" fill="${accent}"/><circle cx="5" cy="112" r="4" fill="${shade(accent, 0.3)}"/>`;
  } else if (sp === 'ptero') {
    tail = `<path d="M60 96 C 44 96, 36 104, 30 112 C 42 112, 52 112, 64 114 Z" fill="${body}"/>`;
    back = `<path class="d-wing" d="M96 84 L22 22 Q36 66 62 102 Z" fill="${shade(accent, -0.1)}"/>`;
    front = `<path class="d-wing d-wing-front" d="M102 86 L52 8 Q74 60 90 106 Z" fill="${accent}" opacity=".95"/>`;
  } else if (sp === 'trex') {
    back = [[60, 80], [72, 70], [86, 65]].map(([x, y]) => `<path d="M${x - 5} ${y + 4} L${x} ${y - 6} L${x + 5} ${y + 4} Z" fill="${accent}"/>`).join('');
  }

  const isBronto = sp === 'bronto';
  const neck = isBronto ? `<path d="M110 92 C 126 64, 132 44, 150 26" stroke="${body}" stroke-width="26" stroke-linecap="round" fill="none"/>` : '';
  const headTransform = isBronto ? 'translate(60 -22) scale(.72)' : '';
  const spots = `<circle cx="78" cy="86" r="6" fill="${accent}" opacity=".45"/><circle cx="94" cy="76" r="4" fill="${accent}" opacity=".45"/><circle cx="66" cy="102" r="4" fill="${accent}" opacity=".45"/>`;

  return `<svg class="dino dino-${sp} ${className}" viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse class="d-shadow" cx="96" cy="160" rx="62" ry="7" fill="#000" opacity=".12"/>
    <g class="d-root">
      <g class="d-tail">${tail}</g>
      ${back}
      <g class="d-leg d-leg-back">
        <rect x="66" y="110" width="24" height="44" rx="12" fill="${dark}"/>
        <ellipse cx="80" cy="154" rx="16" ry="7" fill="${dark}"/>
      </g>
      <ellipse cx="92" cy="100" rx="44" ry="36" fill="${body}"/>
      <ellipse cx="104" cy="110" rx="26" ry="22" fill="${belly}"/>
      ${spots}
      <g class="d-leg d-leg-front">
        <rect x="100" y="112" width="22" height="42" rx="11" fill="${body}"/>
        <ellipse cx="114" cy="154" rx="15" ry="7" fill="${body}"/>
        <path d="M106 156 v-4 M114 157 v-4 M122 156 v-4" stroke="${dark}" stroke-width="2" stroke-linecap="round"/>
      </g>
      ${sp === 'ptero' ? '' : `<path class="d-arm" d="M120 98 q 12 4 13 15" stroke="${dark}" stroke-width="8" fill="none" stroke-linecap="round"/>`}
      ${front}
      ${neck}
      <g class="d-head"><g transform="${headTransform}">${headSVG(d, c)}</g></g>
    </g>
  </svg>`;
}

let eggCounter = 0;

/** A speckled egg split into top/bottom halves (for hatching) with progressive cracks. */
function eggSVG({ color = '#fff6e0', spot = '#9fd8a8' } = {}) {
  const id = `egg${++eggCounter}`;
  const shape = 'M60 8 C 96 8, 113 70, 111 100 C 109 131, 88 147, 60 147 C 32 147, 11 131, 9 100 C 7 70, 24 8, 60 8 Z';
  const zig = '120,78 105,88 90,74 75,90 60,74 45,90 30,74 15,88 0,78';
  const fill = `<path d="${shape}" fill="${color}" stroke="${shade(color, -0.25)}" stroke-width="3"/>
    <circle cx="40" cy="44" r="9" fill="${spot}"/><circle cx="78" cy="62" r="12" fill="${spot}"/>
    <circle cx="36" cy="104" r="11" fill="${spot}"/><circle cx="82" cy="118" r="8" fill="${spot}"/>
    <circle cx="60" cy="30" r="5" fill="${spot}"/>
    <ellipse cx="38" cy="60" rx="8" ry="16" fill="#fff" opacity=".5" transform="rotate(20 38 60)"/>`;
  return `<svg class="egg" viewBox="-10 -10 140 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id="${id}-top"><polygon points="0,-10 120,-10 ${zig}"/></clipPath>
      <clipPath id="${id}-bot"><polygon points="${zig.split(' ').reverse().join(' ')} 120,160 0,160"/></clipPath>
    </defs>
    <g class="egg-bottom" clip-path="url(#${id}-bot)">${fill}</g>
    <g class="egg-top" clip-path="url(#${id}-top)">${fill}</g>
    <g class="cracks" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="crack crack-1" d="M84 34 L76 46 L86 54 L78 64"/>
      <path class="crack crack-2" d="M30 60 L42 68 L34 78 L46 84"/>
      <path class="crack crack-3" d="M60 74 L70 86 L82 76 L94 88"/>
      <path class="crack crack-4" d="M8 80 L22 88 L30 74 L45 90 L60 74"/>
    </g>
  </svg>`;
}

/** Simple nest bowl drawn in front of an egg. */
function nestSVG() {
  const twigs = Array.from({ length: 14 }, (_, i) => {
    const x = 12 + i * 13; const y = 30 + (i % 3) * 6;
    return `<path d="M${x} ${y} q 14 -10 30 2" stroke="#a5703f" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }).join('');
  return `<svg class="nest" viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 24 Q 110 0 214 24 Q 200 76 110 78 Q 20 76 6 24 Z" fill="#c68a52"/>
    ${twigs}
    <path d="M18 32 Q 110 58 202 32" stroke="#8a5a30" stroke-width="4" fill="none"/>
  </svg>`;
}

/** Rock with a glowing tail for the meteor mode. */
function meteorSVG() {
  return `<svg class="meteor-art" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="mtail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe066" stop-opacity="0"/><stop offset="1" stop-color="#ff922b" stop-opacity=".9"/>
    </linearGradient></defs>
    <path d="M38 0 L82 0 L96 100 L24 100 Z" fill="url(#mtail)"/>
    <circle cx="60" cy="110" r="44" fill="#8d6e63"/>
    <circle cx="44" cy="96" r="9" fill="#6d4c41"/><circle cx="78" cy="124" r="7" fill="#6d4c41"/><circle cx="80" cy="94" r="5" fill="#6d4c41"/>
  </svg>`;
}

/** A cute prehistoric patterned ball the dinos bounce and play with while running. */
function playBallSVG() {
  return `<svg class="play-ball-art" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="32" cy="58" rx="22" ry="5" fill="#000" opacity=".18"/>
    <circle cx="32" cy="30" r="26" fill="#ff6b6b" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M12 18 Q 32 30 18 50" stroke="#ffd43b" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M52 18 Q 32 30 46 50" stroke="#4dabf7" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="30" r="9" fill="#fff" stroke="#2b3a4a" stroke-width="2.5"/>
    <ellipse cx="23" cy="18" rx="6" ry="3.5" fill="#fff" opacity=".6" transform="rotate(-30 23 18)"/>
  </svg>`;
}

/** A friendly golden prehistoric dragonfly/butterfly fluttering ahead of the dinos. */
function butterflySVG() {
  return `<svg class="play-butterfly-art" viewBox="0 0 54 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="27" cy="22" rx="3.5" ry="13" fill="#6d4c41"/>
    <circle cx="27" cy="9" r="4.5" fill="#4e342e"/>
    <path d="M25 6 Q 21 0 17 2 M29 6 Q 33 0 37 2" stroke="#4e342e" stroke-width="2" fill="none"/>
    <g class="bf-wing-l">
      <ellipse cx="14" cy="15" rx="12" ry="8" fill="#ffd43b" stroke="#f08c00" stroke-width="1.8" transform="rotate(-25 14 15)"/>
      <ellipse cx="16" cy="27" rx="9" ry="6" fill="#ff922b" stroke="#e8590c" stroke-width="1.8" transform="rotate(15 16 27)"/>
      <circle cx="14" cy="15" r="3.5" fill="#ff6b6b" opacity=".7"/>
    </g>
    <g class="bf-wing-r">
      <ellipse cx="40" cy="15" rx="12" ry="8" fill="#ffd43b" stroke="#f08c00" stroke-width="1.8" transform="rotate(25 40 15)"/>
      <ellipse cx="38" cy="27" rx="9" ry="6" fill="#ff922b" stroke="#e8590c" stroke-width="1.8" transform="rotate(-15 38 27)"/>
      <circle cx="40" cy="15" r="3.5" fill="#ff6b6b" opacity=".7"/>
    </g>
  </svg>`;
}


    Object.assign(exports, { shade, dinoSVG, eggSVG, nestSVG, meteorSVG, playBallSVG, butterflySVG });
  });

  /* === Module: engine.js === */
  define("engine", function(exports, require) {
// Core typing logic shared by all game modes. Pure (time is injected) so it can be tested.

/** Turn a KeyboardEvent.key value into a single typed character, or null to ignore it. */
function normalizeKey(key) {
  if (key === 'Spacebar' || key === 'Space') return ' ';
  if (typeof key !== 'string' || key.length !== 1) return null;
  return key;
}

/** Words per minute using the standard 5-characters-per-word convention. */
function computeWpm(chars, ms) {
  if (!ms || ms <= 0) return 0;
  return chars / 5 / (ms / 60000);
}

function accuracyOf(correct, errors) {
  const total = correct + errors;
  return total === 0 ? 100 : (correct / total) * 100;
}

/** Collects per-key first-try hits/misses and reaction times for one session. */
class KeyTracker {
  constructor() { this.keys = {}; }

  record(ch, hit, ms) {
    const k = (this.keys[ch] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });
    if (hit) k.hits++; else k.misses++;
    if (ms != null && ms > 0 && ms < 5000) { k.ms += ms; k.timed++; }
  }
}

/**
 * One run through a fixed piece of text. The cursor only advances on the correct
 * key – mistakes are counted but never need to be deleted, which keeps things
 * simple for young children.
 */
class TypingSession {
  constructor(text, { now = () => performance.now(), tracker = new KeyTracker() } = {}) {
    this.text = text;
    this.now = now;
    this.tracker = tracker;
    this.index = 0;
    this.correct = 0;
    this.errors = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.startedAt = null;
    this.finishedAt = null;
    this.lastAt = null;
    this.missedHere = false;
  }

  get current() { return this.text[this.index]; }
  get done() { return this.index >= this.text.length; }
  get progress() { return this.text.length ? this.index / this.text.length : 1; }

  press(ch) {
    if (this.done || ch == null) return { type: 'ignored' };
    const t = this.now();
    if (this.startedAt == null) this.startedAt = t;
    const expected = this.text[this.index];
    if (ch === expected) {
      this.tracker.record(expected, !this.missedHere, this.lastAt == null ? null : t - this.lastAt);
      this.correct++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      this.lastAt = t;
      this.missedHere = false;
      const index = this.index++;
      if (this.done) this.finishedAt = t;
      return { type: 'correct', index, expected, done: this.done, streak: this.streak };
    }
    this.errors++;
    this.streak = 0;
    this.missedHere = true;
    return { type: 'wrong', index: this.index, expected, got: ch };
  }

  elapsed() {
    if (this.startedAt == null) return 0;
    return (this.finishedAt ?? this.now()) - this.startedAt;
  }

  stats() {
    const elapsedMs = this.elapsed();
    return {
      chars: this.index,
      correct: this.correct,
      errors: this.errors,
      accuracy: accuracyOf(this.correct, this.errors),
      wpm: computeWpm(this.index, elapsedMs),
      elapsedMs,
      bestStreak: this.bestStreak,
    };
  }
}

/**
 * Merge one session's per-key stats into a player's long-term stats. Old data is
 * halved once a key has lots of samples so recent practice counts most.
 */
function mergeKeyStats(into, session) {
  for (const [ch, s] of Object.entries(session)) {
    const k = (into[ch] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });
    k.hits += s.hits; k.misses += s.misses; k.ms += s.ms; k.timed += s.timed;
    if (k.hits + k.misses > 300) {
      for (const f of ['hits', 'misses', 'ms', 'timed']) k[f] = Math.round(k[f] / 2);
    }
  }
  return into;
}

/** Smoothed miss rate (0..1) for a key. */
function missRate(s) {
  if (!s) return 0;
  return (s.misses + 0.5) / (s.hits + s.misses + 2);
}

/**
 * Turn long-term key stats into generator weights: keys that are missed often or
 * typed slowly get picked more.
 */
function weightsFromKeyStats(keyStats = {}) {
  const avgMs = (() => {
    let ms = 0; let n = 0;
    for (const s of Object.values(keyStats)) { ms += s.ms; n += s.timed; }
    return n ? ms / n : 0;
  })();
  const weights = {};
  for (const [ch, s] of Object.entries(keyStats)) {
    let w = 1 + 6 * missRate(s);
    if (avgMs && s.timed >= 3) w *= Math.min(2, Math.max(0.75, (s.ms / s.timed) / avgMs));
    weights[ch] = w;
  }
  return weights;
}

/** The keys a player finds hardest, worst first. */
function trickyKeys(keyStats = {}, n = 6) {
  return Object.entries(keyStats)
    .filter(([ch, s]) => ch !== ' ' && s.hits + s.misses >= 4)
    .sort((a, b) => missRate(b[1]) - missRate(a[1]))
    .slice(0, n)
    .map(([ch]) => ch);
}

    Object.assign(exports, { normalizeKey, computeWpm, accuracyOf, KeyTracker, TypingSession, mergeKeyStats, missRate, weightsFromKeyStats, trickyKeys });
  });

  /* === Module: textgen.js === */
  define("textgen", function(exports, require) {
// Lesson text generation. Everything here is pure and driven by a seeded RNG so
// it can be tested deterministically.
const { WORDS, NAMES, SENTENCES, QUESTIONS, APOSTROPHES, NUMBER_SENTENCES, FACTS } = require("words");

/** Small, fast seeded PRNG. Returns a function producing floats in [0, 1). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function weightedPick(rng, items, weightOf) {
  let total = 0;
  const ws = items.map((it) => { const w = Math.max(0.0001, weightOf(it)); total += w; return w; });
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Can every character of `str` be typed with the keys in `poolSet`? */
function canType(str, poolSet) {
  for (const ch of str) {
    if (ch === ' ') continue;
    if (/^[A-Z]$/.test(ch)) {
      if (!poolSet.has('Shift') || !poolSet.has(ch.toLowerCase())) return false;
    } else if (!poolSet.has(ch)) {
      return false;
    }
  }
  return true;
}

/** Printable single characters in a pool (drops space and the Shift marker). */
function typeableChars(pool) {
  return pool.filter((k) => k.length === 1 && k !== ' ');
}

const wOf = (weights) => (ch) => (weights && weights[ch]) || 1;

/**
 * Sequence of single keys for the "hatch" (find-the-key) mode.
 * New keys are introduced first and appear more often; no immediate repeats.
 */
function hatchSequence({ pool, focus = [], count, rng }) {
  const keys = pool.filter((k) => k !== 'Shift');
  const fresh = focus.filter((k) => keys.includes(k));
  const seq = [];
  // Start by meeting each new key twice so the child learns where it is.
  for (const k of fresh) { seq.push(k, k); }
  while (seq.length < count) {
    const prev = seq[seq.length - 1];
    const source = fresh.length && rng() < 0.55 ? fresh : keys;
    let k = pick(rng, source);
    if (keys.length > 1 && k === prev) k = pick(rng, keys.filter((x) => x !== prev));
    seq.push(k);
  }
  return seq.slice(0, count);
}

/** Letter drill such as "fff jjj fjf jfj fj". */
function drillText({ pool, focus = [], length, rng, weights }) {
  const chars = typeableChars(pool);
  const focusChars = typeableChars(focus).filter((c) => chars.includes(c));
  const fc = focusChars.length ? focusChars : chars;
  const w = wOf(weights);
  const pickFocus = () => weightedPick(rng, fc, w);
  const pickAny = () => weightedPick(rng, chars, w);
  const groups = [];
  let total = 0;
  while (total < length) {
    const r = rng();
    let g = '';
    if (r < 0.3) {
      g = pickFocus().repeat(2 + Math.floor(rng() * 2));
    } else if (r < 0.6 && chars.length > 1) {
      const a = pickFocus();
      let b = pickAny();
      if (b === a) b = pick(rng, chars.filter((c) => c !== a));
      const n = 3 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) g += i % 2 ? b : a;
    } else {
      const n = 2 + Math.floor(rng() * 3);
      for (let i = 0; i < n; i++) g += rng() < 0.5 ? pickFocus() : pickAny();
    }
    groups.push(g);
    total += g.length + 1;
  }
  return groups.join(' ');
}

function capitalize(w) { return w[0].toUpperCase() + w.slice(1); }

/** Space-separated real words using only known keys, favouring new/weak keys. */
function wordsText({ pool, focus = [], count, rng, weights, capitals = false, names = false, bank = WORDS }) {
  const poolSet = new Set(pool);
  const cand = [...new Set(bank)].filter((wd) => canType(wd, poolSet));
  if (cand.length < 6) {
    // Not enough real words yet – blend in a drill so the lesson is still useful.
    const words = cand.length ? Array.from({ length: Math.ceil(count / 2) }, () => pick(rng, cand)) : [];
    const drill = drillText({ pool, focus, length: count * 3, rng, weights }).split(' ');
    return shuffle(rng, [...words, ...drill.slice(0, count - words.length)]).join(' ');
  }
  const focusChars = typeableChars(focus);
  const focusCand = cand.filter((wd) => focusChars.some((c) => wd.includes(c)));
  const w = wOf(weights);
  const score = (wd) => [...wd].reduce((s, c) => s + w(c), 0) / wd.length;
  const nameCand = names ? NAMES.filter((n) => canType(n, poolSet)) : [];
  const out = [];
  for (let i = 0; i < count; i++) {
    let wd;
    if (nameCand.length && i % 2 === 0) {
      wd = pick(rng, nameCand);
    } else {
      const source = focusCand.length && rng() < 0.6 ? focusCand : cand;
      wd = weightedPick(rng, source, score);
      if (wd === out[out.length - 1]) wd = pick(rng, source);
      if (capitals && rng() < 0.5) wd = capitalize(wd);
    }
    out.push(wd);
  }
  return out.join(' ');
}

/** Whole sentences from a bank, filtered by known keys, joined up to ~length chars. */
function sentencesText({ pool, bank, length, rng, fallback }) {
  const poolSet = new Set(pool);
  const cand = bank.filter((s) => canType(s, poolSet));
  if (!cand.length) return fallback();
  const out = [];
  let total = 0;
  let bag = [];
  while (total < length || out.length === 0) {
    if (!bag.length) bag = shuffle(rng, cand);
    const s = bag.pop();
    out.push(s);
    total += s.length + 1;
  }
  return out.join(' ');
}

/** Number drill mixing digit groups and short "3 eggs" style phrases. */
function numbersText({ pool, focus = [], count, rng }) {
  const digits = typeableChars(pool).filter((c) => /\d/.test(c));
  const fd = typeableChars(focus).filter((c) => /\d/.test(c));
  const d = fd.length ? fd : digits;
  const poolSet = new Set(pool);
  const nouns = ['eggs', 'dinos', 'bones', 'ferns', 'rocks', 'stars', 'nests', 'claws'].filter((n) => canType(n, poolSet));
  const out = [];
  for (let i = 0; i < count; i++) {
    const n = 1 + Math.floor(rng() * 3);
    let g = '';
    for (let j = 0; j < n; j++) g += rng() < 0.7 ? pick(rng, d) : pick(rng, digits);
    out.push(g);
    if (nouns.length && rng() < 0.35) { out.push(pick(rng, nouns)); i++; }
  }
  return out.slice(0, count).join(' ');
}

/** Items that fall in "meteor" mode. */
function meteorItems({ pool, focus = [], kind, count, rng, weights }) {
  const poolSet = new Set(pool);
  const chars = typeableChars(pool).filter((c) => kind === 'numbers' || !/\d/.test(c));
  const w = wOf(weights);
  const items = [];
  if (kind === 'letters') {
    const fc = typeableChars(focus).filter((c) => chars.includes(c));
    for (let i = 0; i < count; i++) {
      items.push(weightedPick(rng, fc.length && rng() < 0.5 ? fc : chars.filter((c) => /[a-z;]/.test(c)), w));
    }
  } else if (kind === 'numbers') {
    const digits = chars.filter((c) => /\d/.test(c));
    for (let i = 0; i < count; i++) {
      const n = 1 + Math.floor(rng() * 3);
      let g = '';
      for (let j = 0; j < n; j++) g += pick(rng, digits);
      items.push(g);
    }
  } else {
    const cand = [...new Set(WORDS)].filter((wd) => wd.length <= 6 && canType(wd, poolSet));
    const score = (wd) => [...wd].reduce((s, c) => s + w(c), 0) / wd.length;
    for (let i = 0; i < count; i++) {
      let wd = weightedPick(rng, cand, score);
      if (items.includes(wd)) wd = pick(rng, cand);
      items.push(wd);
    }
  }
  return items;
}

/**
 * Build the content for a level.
 * @returns {string | string[]} a string for text modes, an array for hatch/meteor modes.
 */
function buildContent(level, pool, { rng, weights } = {}) {
  const focus = level.newKeys || [];
  const words = (opts = {}) => wordsText({ pool, focus, count: level.count || 10, rng, weights, ...opts });
  const sentences = (bank) => sentencesText({ pool, bank, length: level.length || 80, rng, fallback: () => words() });
  switch (level.content) {
    case 'keys': return hatchSequence({ pool, focus, count: level.count || 10, rng });
    case 'drill': return drillText({ pool, focus, length: level.length || 30, rng, weights });
    case 'words': return words();
    case 'capwords': return words({ capitals: true });
    case 'names': return words({ names: true, capitals: true });
    case 'sentences': return sentences(SENTENCES);
    case 'questions': return sentences([...QUESTIONS, ...SENTENCES.slice(0, 6)]);
    case 'apostrophes': return sentences([...APOSTROPHES, ...QUESTIONS.slice(0, 4)]);
    case 'numbers': return numbersText({ pool, focus, count: level.count || 12, rng });
    case 'numsentences': return sentences(NUMBER_SENTENCES);
    case 'paragraph': return sentences([...FACTS, ...SENTENCES, ...QUESTIONS, ...APOSTROPHES, ...NUMBER_SENTENCES]);
    case 'facts': return sentences(FACTS);
    case 'letters': return meteorItems({ pool, focus, kind: 'letters', count: level.count || 15, rng, weights });
    case 'meteorwords': return meteorItems({ pool, focus, kind: 'words', count: level.count || 12, rng, weights });
    case 'meteornumbers': return meteorItems({ pool, focus, kind: 'numbers', count: level.count || 12, rng, weights });
    default: throw new Error(`Unknown content type: ${level.content}`);
  }
}

    Object.assign(exports, { mulberry32, pick, weightedPick, shuffle, canType, typeableChars, hatchSequence, drillText, wordsText, sentencesText, numbersText, meteorItems, buildContent });
  });

  /* === Module: curriculum.js === */
  define("curriculum", function(exports, require) {
// The learning path. Seven worlds that take a child from "find the big glowing
// key" (age 4) through the home row, the whole keyboard, capitals, punctuation
// and numbers, up to full-speed racing.
//
// Level fields:
//   id, title, mode ('hatch' | 'trail' | 'meteor' | 'race'), content (see textgen.buildContent)
//   newKeys   – keys introduced by this level (added to the cumulative key pool)
//   count / length – amount of content (items/words or characters)
//   targetWpm – speed for 3 stars (omit = no speed requirement)
//   minAcc    – accuracy (%) needed to pass (1 star)
//   fall / spawn / maxOnScreen – meteor tuning (seconds to fall, seconds between spawns)
//   reward    – dino id unlocked on first completion
//   intro     – friendly line shown & spoken when the level starts

const WORLDS = [
  {
    id: 'nest', name: 'Egg Nest', theme: 'nest', ages: 'Ages 4+',
    blurb: 'Find the glowing keys to hatch baby dinos!',
    levels: [
      { id: 'nest-1', title: 'The Big Space Bar', mode: 'hatch', content: 'keys', newKeys: [' '], count: 6, reward: 'sunny',
        intro: 'Press the big long space bar with your thumb!' },
      { id: 'nest-2', title: 'F and J', mode: 'hatch', content: 'keys', newKeys: ['f', 'j'], count: 8, reward: 'trixie',
        intro: 'F and J have little bumps. Your pointer fingers live there!' },
      { id: 'nest-3', title: 'D and K', mode: 'hatch', content: 'keys', newKeys: ['d', 'k'], count: 10, reward: 'steggy',
        intro: 'D and K are for your middle fingers.' },
      { id: 'nest-4', title: 'S and L', mode: 'hatch', content: 'keys', newKeys: ['s', 'l'], count: 10, reward: 'bronty',
        intro: 'S and L are for your ring fingers.' },
      { id: 'nest-5', title: 'A and ;', mode: 'hatch', content: 'keys', newKeys: ['a', ';'], count: 12, reward: 'petra',
        intro: 'A and semicolon are for your pinkies.' },
      { id: 'nest-6', title: 'G and H', mode: 'hatch', content: 'keys', newKeys: ['g', 'h'], count: 12, reward: 'anky',
        intro: 'Stretch your pointer fingers to G and H!' },
      { id: 'nest-7', title: 'Home Row Hatch', mode: 'hatch', content: 'keys', newKeys: [], count: 16, reward: 'parry',
        intro: 'You know the whole home row! Let\'s hatch one more egg.' },
    ],
  },
  {
    id: 'meadow', name: 'Home Row Meadow', theme: 'meadow', ages: 'Ages 5+', resetPool: true,
    blurb: 'Keep your fingers on the home row and walk through the meadow.',
    levels: [
      { id: 'meadow-1', title: 'Pointer Pals', mode: 'trail', content: 'drill', newKeys: ['f', 'j'], length: 20, targetWpm: 4, minAcc: 50,
        intro: 'Put your pointer fingers on the bumps. Type the letters to walk!' },
      { id: 'meadow-2', title: 'Middle March', mode: 'trail', content: 'drill', newKeys: ['d', 'k'], length: 24, targetWpm: 5, minAcc: 55 },
      { id: 'meadow-3', title: 'Ring Ramble', mode: 'trail', content: 'drill', newKeys: ['s', 'l'], length: 26, targetWpm: 5, minAcc: 55 },
      { id: 'meadow-4', title: 'Pinky Path', mode: 'trail', content: 'drill', newKeys: ['a', ';'], length: 28, targetWpm: 6, minAcc: 60 },
      { id: 'meadow-5', title: 'G and H Hop', mode: 'trail', content: 'drill', newKeys: ['g', 'h'], length: 30, targetWpm: 6, minAcc: 60 },
      { id: 'meadow-6', title: 'First Words', mode: 'trail', content: 'words', newKeys: [], count: 8, targetWpm: 7, minAcc: 65,
        intro: 'Real words! Press space between each word.' },
      { id: 'meadow-7', title: 'Meteor Shower', mode: 'meteor', content: 'letters', newKeys: [], count: 14, fall: 11, spawn: 3.2, maxOnScreen: 2,
        minAcc: 55, reward: 'clover', intro: 'Type the letters on the meteors to turn them into stars!' },
    ],
  },
  {
    id: 'jungle', name: 'Top Row Jungle', theme: 'jungle', ages: 'Ages 6+',
    blurb: 'Reach up to the top row and swing through the jungle.',
    levels: [
      { id: 'jungle-1', title: 'E and I', mode: 'trail', content: 'drill', newKeys: ['e', 'i'], length: 30, targetWpm: 7, minAcc: 65,
        intro: 'Reach up with your middle fingers for E and I.' },
      { id: 'jungle-2', title: 'R and U', mode: 'trail', content: 'drill', newKeys: ['r', 'u'], length: 30, targetWpm: 7, minAcc: 65 },
      { id: 'jungle-3', title: 'Jungle Words', mode: 'trail', content: 'words', newKeys: [], count: 10, targetWpm: 9, minAcc: 70 },
      { id: 'jungle-4', title: 'T and Y', mode: 'trail', content: 'drill', newKeys: ['t', 'y'], length: 32, targetWpm: 8, minAcc: 70 },
      { id: 'jungle-5', title: 'W and O', mode: 'trail', content: 'drill', newKeys: ['w', 'o'], length: 32, targetWpm: 8, minAcc: 70 },
      { id: 'jungle-6', title: 'Q and P', mode: 'trail', content: 'drill', newKeys: ['q', 'p'], length: 32, targetWpm: 8, minAcc: 70 },
      { id: 'jungle-7', title: 'Treetop Words', mode: 'trail', content: 'words', newKeys: [], count: 12, targetWpm: 11, minAcc: 75 },
      { id: 'jungle-8', title: 'Coconut Meteors', mode: 'meteor', content: 'meteorwords', newKeys: [], count: 12, fall: 13, spawn: 3.6, maxOnScreen: 3,
        minAcc: 60, reward: 'mango', intro: 'Now the meteors have whole words!' },
    ],
  },
  {
    id: 'volcano', name: 'Bottom Row Volcano', theme: 'volcano', ages: 'Ages 7+',
    blurb: 'Reach down to the bottom row – watch out for lava!',
    levels: [
      { id: 'volcano-1', title: 'V and M', mode: 'trail', content: 'drill', newKeys: ['v', 'm'], length: 32, targetWpm: 9, minAcc: 75,
        intro: 'Reach down with your pointer fingers for V and M.' },
      { id: 'volcano-2', title: 'B and N', mode: 'trail', content: 'drill', newKeys: ['b', 'n'], length: 32, targetWpm: 9, minAcc: 75 },
      { id: 'volcano-3', title: 'Lava Words', mode: 'trail', content: 'words', newKeys: [], count: 12, targetWpm: 12, minAcc: 78 },
      { id: 'volcano-4', title: 'C and Comma', mode: 'trail', content: 'drill', newKeys: ['c', ','], length: 34, targetWpm: 10, minAcc: 78 },
      { id: 'volcano-5', title: 'X and Period', mode: 'trail', content: 'drill', newKeys: ['x', '.'], length: 34, targetWpm: 10, minAcc: 78 },
      { id: 'volcano-6', title: 'Z Zigzag', mode: 'trail', content: 'drill', newKeys: ['z'], length: 34, targetWpm: 10, minAcc: 78 },
      { id: 'volcano-7', title: 'Every Letter', mode: 'trail', content: 'words', newKeys: [], count: 14, targetWpm: 14, minAcc: 80 },
      { id: 'volcano-8', title: 'Eruption!', mode: 'meteor', content: 'meteorwords', newKeys: [], count: 16, fall: 10, spawn: 2.8, maxOnScreen: 4,
        minAcc: 65, reward: 'ember', intro: 'The volcano is erupting! Type fast!' },
    ],
  },
  {
    id: 'canyon', name: 'Capital Canyon', theme: 'canyon', ages: 'Ages 7+',
    blurb: 'Capital letters, sentences and punctuation.',
    levels: [
      { id: 'canyon-1', title: 'Big Letters', mode: 'trail', content: 'capwords', newKeys: ['Shift'], count: 10, targetWpm: 10, minAcc: 75,
        intro: 'Hold Shift with the pinky on the OTHER hand to make a capital letter.' },
      { id: 'canyon-2', title: 'Dino Names', mode: 'trail', content: 'names', newKeys: [], count: 12, targetWpm: 12, minAcc: 78 },
      { id: 'canyon-3', title: 'Short Sentences', mode: 'trail', content: 'sentences', newKeys: [], length: 70, targetWpm: 13, minAcc: 80 },
      { id: 'canyon-4', title: 'Questions?', mode: 'trail', content: 'questions', newKeys: ['/', '?', '!', '1'], length: 80, targetWpm: 13, minAcc: 80,
        intro: 'Question marks and exclamation marks need Shift too!' },
      { id: 'canyon-5', title: "Let's Apostrophe", mode: 'trail', content: 'apostrophes', newKeys: ["'"], length: 80, targetWpm: 14, minAcc: 80 },
      { id: 'canyon-6', title: 'Canyon Race', mode: 'race', content: 'sentences', newKeys: [], length: 110, targetWpm: 16, minAcc: 85,
        reward: 'dusty', intro: 'Race Zip the pterodactyl to the finish line!' },
    ],
  },
  {
    id: 'mountain', name: 'Number Mountain', theme: 'mountain', ages: 'Ages 8+',
    blurb: 'Climb up to the number row.',
    levels: [
      { id: 'mountain-1', title: '1 2 3 4 5', mode: 'trail', content: 'numbers', newKeys: ['2', '3', '4', '5'], count: 12, targetWpm: 10, minAcc: 75,
        intro: 'Reach way up to the number row. Keep your other fingers home!' },
      { id: 'mountain-2', title: '6 7 8 9 0', mode: 'trail', content: 'numbers', newKeys: ['6', '7', '8', '9', '0'], count: 12, targetWpm: 10, minAcc: 75 },
      { id: 'mountain-3', title: 'Counting Dinos', mode: 'trail', content: 'numsentences', newKeys: [], length: 90, targetWpm: 15, minAcc: 82 },
      { id: 'mountain-4', title: 'Avalanche', mode: 'meteor', content: 'meteornumbers', newKeys: [], count: 16, fall: 9, spawn: 2.6, maxOnScreen: 4,
        minAcc: 65, reward: 'frosty' },
    ],
  },
  {
    id: 'sky', name: 'Sky Race', theme: 'sky', ages: 'Ages 8+',
    blurb: 'Fly with the pterodactyls. How fast can you type?',
    levels: [
      { id: 'sky-1', title: 'Glider', mode: 'race', content: 'paragraph', newKeys: [], length: 120, targetWpm: 15, minAcc: 85 },
      { id: 'sky-2', title: 'Flapper', mode: 'race', content: 'paragraph', newKeys: [], length: 150, targetWpm: 20, minAcc: 88 },
      { id: 'sky-3', title: 'Soarer', mode: 'race', content: 'facts', newKeys: [], length: 180, targetWpm: 25, minAcc: 90 },
      { id: 'sky-4', title: 'Swooper', mode: 'race', content: 'paragraph', newKeys: [], length: 220, targetWpm: 30, minAcc: 90 },
      { id: 'sky-5', title: 'Jet Stream', mode: 'race', content: 'facts', newKeys: [], length: 260, targetWpm: 40, minAcc: 92 },
      { id: 'sky-6', title: 'Thunder Wings', mode: 'race', content: 'paragraph', newKeys: [], length: 300, targetWpm: 50, minAcc: 94 },
      { id: 'sky-7', title: 'Speed of Light', mode: 'race', content: 'facts', newKeys: [], length: 350, targetWpm: 60, minAcc: 95,
        reward: 'zephyr', intro: 'This is it – full speed touch typing!' },
    ],
  },
];

/** Flat, ordered list of all levels with world info attached. */
const LEVELS = [];
WORLDS.forEach((world, wi) => {
  world.levels.forEach((level, li) => {
    LEVELS.push(Object.assign(level, { worldId: world.id, worldIndex: wi, indexInWorld: li, globalIndex: LEVELS.length }));
  });
});

const BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

function getLevel(id) { return BY_ID.get(id); }
function getWorld(id) { return WORLDS.find((w) => w.id === id); }

/** Cumulative set of keys known after completing everything up to and including `levelId`. */
function poolFor(levelId) {
  const level = BY_ID.get(levelId);
  if (!level) throw new Error(`Unknown level ${levelId}`);
  const keys = new Set();
  let start = 0;
  for (let i = 0; i <= level.globalIndex; i++) {
    if (LEVELS[i].indexInWorld === 0 && WORLDS[LEVELS[i].worldIndex].resetPool) start = i;
  }
  for (let i = start; i <= level.globalIndex; i++) for (const k of LEVELS[i].newKeys) keys.add(k);
  // The space bar is always needed between words/groups once we leave the nest.
  if (level.mode !== 'hatch') keys.add(' ');
  return [...keys];
}

function nextLevel(levelId) {
  const level = BY_ID.get(levelId);
  return level ? LEVELS[level.globalIndex + 1] || null : null;
}

/**
 * Is a level playable?
 * @param {string} levelId
 * @param {Record<string, {stars:number}>} progress  per-level results
 * @param {{startWorld?: number, unlockAll?: boolean}} opts
 */
function isUnlocked(levelId, progress, { startWorld = 0, unlockAll = false } = {}) {
  const level = BY_ID.get(levelId);
  if (!level) return false;
  if (unlockAll) return true;
  if (level.worldIndex < startWorld) return true;
  if (level.worldIndex === startWorld && level.indexInWorld === 0) return true;
  if (level.globalIndex === 0) return true;
  const prev = LEVELS[level.globalIndex - 1];
  return !!(progress[prev.id] && progress[prev.id].stars > 0);
}

/** First level that is unlocked but not yet passed – where "Play" should take you. */
function currentLevel(progress, opts = {}) {
  for (const l of LEVELS) {
    if (l.worldIndex < (opts.startWorld || 0)) continue;
    if (isUnlocked(l.id, progress, opts) && !(progress[l.id] && progress[l.id].stars > 0)) return l;
  }
  return LEVELS[LEVELS.length - 1];
}

/**
 * Stars (0–3) for a result.
 * stats: { accuracy: 0-100, wpm: number }
 */
function starsFor(level, stats) {
  if (level.mode === 'hatch') return 3; // little ones always succeed
  const minAcc = level.minAcc ?? 70;
  const acc = stats.accuracy;
  if (acc < minAcc) return 0;
  const target = level.targetWpm;
  const speedOk = (f) => !target || stats.wpm >= target * f;
  const twoAcc = Math.max(minAcc + 10, 85);
  const threeAcc = Math.max(minAcc + 15, 94);
  if (acc >= Math.min(threeAcc, 98) && speedOk(1)) return 3;
  if (acc >= Math.min(twoAcc, 96) && speedOk(0.7)) return 2;
  return 1;
}

/** Placement options offered when creating a player. */
const START_OPTIONS = [
  { world: 0, emoji: '🥚', title: 'Just starting', desc: 'Finding keys for the very first time (ages 4–5)' },
  { world: 1, emoji: '🌼', title: 'I know my letters', desc: 'Ready to learn the home row (ages 5–6)' },
  { world: 2, emoji: '🌴', title: 'Learning to type', desc: 'I know the home row (ages 6–8)' },
  { world: 4, emoji: '🏜️', title: 'I can type words', desc: 'Ready for capitals and sentences' },
  { world: 6, emoji: '☁️', title: 'Ready to race', desc: 'I can touch type – make me faster!' },
];

    Object.assign(exports, { WORLDS, LEVELS, getLevel, getWorld, poolFor, nextLevel, isUnlocked, currentLevel, starsFor, START_OPTIONS });
  });

  /* === Module: storage.js === */
  define("storage", function(exports, require) {
// Player profiles & progress, persisted to localStorage (or any getItem/setItem backend).
const { getLevel } = require("curriculum");
const { mergeKeyStats } = require("engine");
const { STARTER_DINO } = require("dinos");

const STORAGE_KEY = 'dinoKeys.v1';

const DEFAULT_SETTINGS = {
  sound: true,
  voice: true,
  music: true,
  keyboard: true,   // show the on-screen keyboard
  hands: true,      // show the finger guide hands
  unlockAll: false,
};

function memoryBackend() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function getDefaultBackend() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('__dino_test__', '1');
      localStorage.removeItem('__dino_test__');
      return localStorage;
    }
  } catch (e) {
    console.warn('localStorage not accessible, using memory storage', e);
  }
  return memoryBackend();
}

class Store {
  constructor(backend) {
    this.backend = backend || getDefaultBackend();
    this.data = { version: 1, currentId: null, profiles: [] };
    this.load();
  }

  load() {
    try {
      const raw = this.backend.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.profiles)) this.data = parsed;
      }
    } catch (e) {
      console.warn('Could not load saved progress', e);
    }
    for (const p of this.data.profiles) p.settings = { ...DEFAULT_SETTINGS, ...p.settings };
  }

  save() {
    try {
      this.backend.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  }

  get profiles() { return this.data.profiles; }

  get current() {
    return this.data.profiles.find((p) => p.id === this.data.currentId) || null;
  }

  select(id) {
    this.data.currentId = id;
    this.save();
    return this.current;
  }

  createProfile({ name, startWorld = 0 }) {
    const p = {
      id: uid(),
      name: (name || 'Player').trim().slice(0, 16) || 'Player',
      startWorld,
      buddy: STARTER_DINO,
      dinos: [STARTER_DINO],
      levels: {},
      keyStats: {},
      settings: { ...DEFAULT_SETTINGS },
      totals: { plays: 0, chars: 0, ms: 0 },
      createdAt: Date.now(),
    };
    this.data.profiles.push(p);
    this.data.currentId = p.id;
    this.save();
    return p;
  }

  deleteProfile(id) {
    this.data.profiles = this.data.profiles.filter((p) => p.id !== id);
    if (this.data.currentId === id) this.data.currentId = null;
    this.save();
  }

  /**
   * Record the outcome of a level for the current player.
   * @returns {{firstClear: boolean, newBest: boolean, newDino: string|null}}
   */
  recordResult(levelId, { stars, stats = {}, perKey = {} }) {
    const p = this.current;
    if (!p) throw new Error('No player selected');
    const prev = p.levels[levelId] || { stars: 0, bestWpm: 0, bestAcc: 0, plays: 0 };
    const entry = {
      stars: Math.max(prev.stars, stars),
      bestWpm: Math.max(prev.bestWpm, Math.round(stats.wpm || 0)),
      bestAcc: Math.max(prev.bestAcc, Math.round(stats.accuracy || 0)),
      plays: prev.plays + 1,
    };
    p.levels[levelId] = entry;
    mergeKeyStats(p.keyStats, perKey);
    p.totals.plays++;
    p.totals.chars += stats.chars || 0;
    p.totals.ms += stats.elapsedMs || 0;

    let newDino = null;
    const level = getLevel(levelId);
    if (stars > 0 && level && level.reward && !p.dinos.includes(level.reward)) {
      p.dinos.push(level.reward);
      newDino = level.reward;
    }
    this.save();
    return { firstClear: prev.stars === 0 && stars > 0, newBest: stars > prev.stars, newDino };
  }

  /** Merge key stats without a level result (e.g. free practice). */
  recordPractice({ stats = {}, perKey = {} }) {
    const p = this.current;
    if (!p) return;
    mergeKeyStats(p.keyStats, perKey);
    p.totals.plays++;
    p.totals.chars += stats.chars || 0;
    p.totals.ms += stats.elapsedMs || 0;
    this.save();
  }

  setBuddy(dinoId) {
    const p = this.current;
    if (p && p.dinos.includes(dinoId)) { p.buddy = dinoId; this.save(); }
  }

  updateSettings(patch) {
    const p = this.current;
    if (!p) return;
    p.settings = { ...p.settings, ...patch };
    this.save();
  }

  updateProfile(patch) {
    const p = this.current;
    if (!p) return;
    Object.assign(p, patch);
    this.save();
  }

  resetProgress() {
    const p = this.current;
    if (!p) return;
    p.levels = {};
    p.keyStats = {};
    p.dinos = [STARTER_DINO];
    p.buddy = STARTER_DINO;
    p.totals = { plays: 0, chars: 0, ms: 0 };
    this.save();
  }
}

function totalStars(profile) {
  return Object.values(profile.levels).reduce((n, l) => n + (l.stars || 0), 0);
}

    Object.assign(exports, { STORAGE_KEY, DEFAULT_SETTINGS, Store, totalStars });
  });

  /* === Module: scene.js === */
  define("scene", function(exports, require) {
// Layered, parallax-scrolling backgrounds for each world. Layers are repeating
// SVG tiles (background-repeat: repeat-x) so they can scroll forever.

const svgUrl = (w, h, body) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}")`;

const tree = (x, y, s, leaf = '#5cb85c', trunk = '#8d6e4f') =>
  `<rect x='${x - 6 * s}' y='${y - 50 * s}' width='${12 * s}' height='${50 * s}' rx='${4 * s}' fill='${trunk}'/>
   <circle cx='${x}' cy='${y - 66 * s}' r='${30 * s}' fill='${leaf}'/>
   <circle cx='${x - 22 * s}' cy='${y - 50 * s}' r='${20 * s}' fill='${leaf}'/>
   <circle cx='${x + 22 * s}' cy='${y - 50 * s}' r='${20 * s}' fill='${leaf}'/>`;

const flower = (x, y, c) =>
  `<path d='M${x} ${y} v-14' stroke='#4c9a4c' stroke-width='3'/>
   <circle cx='${x}' cy='${y - 18}' r='6' fill='${c}'/><circle cx='${x}' cy='${y - 18}' r='2.5' fill='#fff3a0'/>`;

const bush = (x, y, s, c) =>
  `<circle cx='${x}' cy='${y - 14 * s}' r='${18 * s}' fill='${c}'/><circle cx='${x + 20 * s}' cy='${y - 10 * s}' r='${14 * s}' fill='${c}'/><circle cx='${x - 18 * s}' cy='${y - 8 * s}' r='${12 * s}' fill='${c}'/>`;

const palm = (x, y, s) => {
  const fr = (a) => `<path d='M${x + 10 * s} ${y - 120 * s} q ${Math.cos(a) * 40 * s} ${-30 * s} ${Math.cos(a) * 70 * s} ${Math.sin(a) * 30 * s + 10 * s}' stroke='#3f9a4a' stroke-width='${12 * s}' fill='none' stroke-linecap='round'/>`;
  return `<path d='M${x} ${y} q ${-6 * s} ${-60 * s} ${10 * s} ${-120 * s}' stroke='#a0703f' stroke-width='${12 * s}' fill='none' stroke-linecap='round'/>
    ${[0, 0.9, 2.2, 3.1].map(fr).join('')}
    <circle cx='${x + 6 * s}' cy='${y - 112 * s}' r='${6 * s}' fill='#8d5a2b'/><circle cx='${x + 16 * s}' cy='${y - 110 * s}' r='${6 * s}' fill='#8d5a2b'/>`;
};

const fern = (x, y, c = '#4caf50') =>
  [-50, -25, 0, 25, 50].map((a) => `<path d='M${x} ${y} q ${a * 0.4} -30 ${a} -40' stroke='${c}' stroke-width='7' fill='none' stroke-linecap='round'/>`).join('');

const rock = (x, y, s, c) => `<path d='M${x - 30 * s} ${y} q ${5 * s} ${-30 * s} ${30 * s} ${-34 * s} q ${28 * s} ${2 * s} ${32 * s} ${34 * s} Z' fill='${c}'/>`;

const cactus = (x, y) => `<g fill='#5aa857'><rect x='${x - 9}' y='${y - 70}' width='18' height='70' rx='9'/>
  <rect x='${x - 30}' y='${y - 50}' width='14' height='30' rx='7'/><rect x='${x - 30}' y='${y - 26}' width='26' height='12' rx='6'/>
  <rect x='${x + 16}' y='${y - 60}' width='14' height='32' rx='7'/><rect x='${x + 4}' y='${y - 34}' width='26' height='12' rx='6'/></g>`;

const pine = (x, y, s) => `<rect x='${x - 5 * s}' y='${y - 20 * s}' width='${10 * s}' height='${20 * s}' fill='#7a5230'/>
  <path d='M${x} ${y - 100 * s} L${x + 30 * s} ${y - 20 * s} L${x - 30 * s} ${y - 20 * s} Z' fill='#2f8f5b'/>
  <path d='M${x} ${y - 100 * s} L${x + 12 * s} ${y - 70 * s} L${x - 12 * s} ${y - 70 * s} Z' fill='#fff'/>`;

const cloudShape = (x, y, s, c = '#fff') =>
  `<g fill='${c}'><circle cx='${x}' cy='${y}' r='${30 * s}'/><circle cx='${x + 34 * s}' cy='${y - 12 * s}' r='${36 * s}'/><circle cx='${x + 72 * s}' cy='${y}' r='${28 * s}'/><rect x='${x}' y='${y}' width='${72 * s}' height='${28 * s}'/></g>`;

const hills = (c1, c2) =>
  `<path d='M0 300 L0 180 Q100 110 200 170 T400 160 T600 150 T800 180 L800 300 Z' fill='${c1}'/>
   <path d='M0 300 L0 230 Q150 170 300 220 T600 210 T800 230 L800 300Z' fill='${c2}'/>`;

const THEMES = {
  nest: {
    sky: 'linear-gradient(#ffd9b0 0%, #ffeccc 45%, #c8f0ff 100%)',
    ground: '#8fd16a',
    far: svgUrl(800, 300, hills('#b9e8a8', '#9ddc8a')),
    near: svgUrl(600, 200, `${bush(60, 200, 1.4, '#6cc35a')}${flower(150, 200, '#ff8fc8')}${flower(170, 200, '#ffd43b')}${tree(300, 200, 0.9, '#76c96a')}${bush(470, 200, 1.1, '#5fb84f')}${flower(540, 200, '#a98bff')}`),
  },
  meadow: {
    sky: 'linear-gradient(#7cc8ff 0%, #bfe9ff 60%, #e6f8ff 100%)',
    ground: '#7fcc5c',
    far: svgUrl(800, 300, hills('#a8e6a1', '#86d57f')),
    near: svgUrl(600, 200, `${tree(80, 200, 1, '#5cb85c')}${flower(180, 200, '#ff6b9a')}${flower(200, 200, '#ffd43b')}${flower(220, 200, '#ffffff')}${bush(330, 200, 1.2, '#69c25b')}${tree(470, 200, 0.75, '#4fae52')}${flower(560, 200, '#ff9f43')}`),
  },
  jungle: {
    sky: 'linear-gradient(#5fd3c4 0%, #a8ede0 60%, #e2fbf4 100%)',
    ground: '#4f9e42',
    far: svgUrl(800, 300, `${hills('#3f9a5f', '#2f8a50')}${palm(140, 240, 0.9)}${palm(520, 230, 0.8)}`),
    near: svgUrl(600, 200, `${fern(60, 200, '#2e8b3e')}${palm(200, 200, 1.2)}${fern(330, 200, '#3aa04a')}${bush(450, 200, 1.3, '#2f8f3f')}${fern(560, 200, '#2e8b3e')}`),
  },
  volcano: {
    sky: 'linear-gradient(#ff9a8b 0%, #ffc38b 55%, #ffe8c2 100%)',
    ground: '#8a5a44',
    far: svgUrl(800, 300, `<path d='M0 300 L0 250 L180 250 L300 90 L340 90 L460 250 L800 250 L800 300Z' fill='#6d4c41'/>
      <path d='M300 90 L340 90 L352 110 Q330 130 318 104 Q306 122 290 104 Z' fill='#ff6b35'/>
      <circle cx='330' cy='60' r='22' fill='#bbb' opacity='.7'/><circle cx='352' cy='36' r='18' fill='#ccc' opacity='.6'/><circle cx='340' cy='12' r='12' fill='#ddd' opacity='.5'/>
      <path d='M560 300 L640 190 L670 190 L760 300Z' fill='#7d5a4f'/>`),
    near: svgUrl(600, 200, `${rock(80, 200, 1.2, '#5d4037')}${fern(200, 200, '#6b8e23')}${rock(330, 200, 0.8, '#4e342e')}${fern(450, 200, '#558b2f')}${rock(540, 200, 1, '#5d4037')}`),
  },
  canyon: {
    sky: 'linear-gradient(#8ed1ff 0%, #ffe1b0 70%, #ffd29a 100%)',
    ground: '#e0a96d',
    far: svgUrl(800, 300, `<path d='M0 300 L0 230 L60 230 L60 140 Q70 130 180 140 L180 230 L340 230 L360 170 L480 170 L500 230 L620 230 L640 110 L760 110 L780 230 L800 230 L800 300Z' fill='#d9774a'/>
      <path d='M60 170 H180 M640 150 H760' stroke='#c0603a' stroke-width='6'/>`),
    near: svgUrl(600, 200, `${cactus(90, 200)}${rock(250, 200, 0.9, '#c46a3a')}${cactus(420, 200)}${rock(540, 200, 0.7, '#b35a30')}`),
  },
  mountain: {
    sky: 'linear-gradient(#89c9ff 0%, #cfe9ff 60%, #f3faff 100%)',
    ground: '#eef6fb',
    far: svgUrl(800, 300, `<path d='M0 300 L0 260 L160 80 L300 240 L440 60 L620 250 L700 160 L800 260 L800 300Z' fill='#8aa4c8'/>
      <path d='M160 80 L196 120 L176 116 L160 130 L142 116 L126 118Z M440 60 L486 112 L462 106 L440 124 L420 108 L396 112Z M700 160 L722 186 L700 184 L684 180Z' fill='#fff'/>`),
    near: svgUrl(600, 200, `${pine(70, 200, 1)}${pine(120, 200, 0.7)}${bush(300, 200, 1, '#ffffff')}${pine(450, 200, 1.1)}${pine(520, 200, 0.8)}`),
  },
  sky: {
    sky: 'linear-gradient(#4dabf7 0%, #a5d8ff 60%, #e7f5ff 100%)',
    ground: '#ffffff',
    far: svgUrl(800, 300, `${cloudShape(40, 200, 1.6, '#e7f5ff')}${cloudShape(420, 160, 1.2, '#f1f9ff')}${cloudShape(620, 230, 1.4, '#e7f5ff')}<rect y='240' width='800' height='60' fill='#e7f5ff'/>`),
    near: svgUrl(600, 200, `${cloudShape(20, 170, 1.1)}${cloudShape(260, 160, 1.4)}${cloudShape(470, 175, 1)}<rect y='175' width='600' height='25' fill='#fff'/>`),
  },
};

/** Render a scene into `host` for a theme. Returns a controller for parallax scrolling. */
function renderScene(host, theme = 'meadow', { drift = false } = {}) {
  const t = THEMES[theme] || THEMES.meadow;
  host.innerHTML = `
    <div class="scene ${drift ? 'drift' : ''}" data-theme="${theme}" style="--sky:${t.sky};--ground:${t.ground}">
      <div class="sky"></div>
      <div class="sun"></div>
      <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
      <div class="layer far"></div>
      <div class="layer near"></div>
      <div class="ground"></div>
    </div>`;
  const scene = host.firstElementChild;
  scene.querySelector('.layer.far').style.backgroundImage = t.far;
  scene.querySelector('.layer.near').style.backgroundImage = t.near;
  return {
    el: scene,
    /** Scroll the parallax layers by `px` (positive = move forward). */
    scrollTo(px) { scene.style.setProperty('--scroll', `${px}`); },
  };
}

/** Render every element with [data-theme] that is an empty .scene-host. */
function renderStaticScenes(root = document) {
  root.querySelectorAll('.scene-host[data-theme]').forEach((h) => {
    if (!h.firstElementChild) renderScene(h, h.dataset.theme, { drift: true });
  });
}

    Object.assign(exports, { THEMES, renderScene, renderStaticScenes });
  });

  /* === Module: audio.js === */
  define("audio", function(exports, require) {
// Sound effects, gentle background music (all synthesized with WebAudio – no
// audio files) and spoken prompts via the Web Speech API.

let ctx = null;
let master = null;
let musicGain = null;
const state = { sound: true, voice: true, music: true };

function ac() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.12;
      musicGain.connect(master);
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  } catch (err) {
    console.warn('WebAudio initialization failed:', err);
    return null;
  }
}

/** Browsers only allow audio after a user gesture – call this from one. */
function unlockAudio() {
  try { ac(); } catch (e) { /* ignore */ }
}

function configureAudio(settings) {
  Object.assign(state, settings);
  if (!state.music) stopMusic();
  if (!state.voice && 'speechSynthesis' in window) speechSynthesis.cancel();
}

function tone(freq, { dur = 0.15, type = 'sine', vol = 0.3, when = 0, slide = null, attack = 0.01, out = null } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out || master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise({ dur = 0.3, vol = 0.2, when = 0, freq = 800, q = 1, type = 'bandpass' } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

// C major pentatonic, so any sequence of "correct" pops sounds musical.
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

const sfx = {
  correct(streak = 0) {
    if (!state.sound) return;
    const f = PENTA[streak % PENTA.length];
    tone(f, { dur: 0.12, type: 'triangle', vol: 0.25 });
    tone(f * 2, { dur: 0.08, type: 'sine', vol: 0.08 });
  },
  wrong() {
    if (!state.sound) return;
    tone(220, { dur: 0.18, type: 'triangle', vol: 0.18, slide: 180 });
  },
  step() {
    if (!state.sound) return;
    noise({ dur: 0.08, vol: 0.12, freq: 300, q: 0.8, type: 'lowpass' });
  },
  crack() {
    if (!state.sound) return;
    noise({ dur: 0.12, vol: 0.35, freq: 2500, q: 2 });
    tone(900, { dur: 0.05, type: 'square', vol: 0.05 });
  },
  hatch() {
    if (!state.sound) return;
    noise({ dur: 0.25, vol: 0.3, freq: 1800, q: 1.5 });
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => tone(f, { dur: 0.25, type: 'triangle', vol: 0.22, when: 0.1 + i * 0.09 }));
  },
  star(i = 0) {
    if (!state.sound) return;
    tone(880 * Math.pow(1.26, i), { dur: 0.35, type: 'sine', vol: 0.25 });
    tone(1760 * Math.pow(1.26, i), { dur: 0.25, type: 'triangle', vol: 0.08, when: 0.05 });
  },
  fanfare() {
    if (!state.sound) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.12, 0.24, 0.36, 0.52, 0.64];
    notes.forEach((f, i) => tone(f, { dur: i === notes.length - 1 ? 0.6 : 0.16, type: 'triangle', vol: 0.25, when: times[i] }));
  },
  tryAgain() {
    if (!state.sound) return;
    [523.25, 466.16, 392].forEach((f, i) => tone(f, { dur: 0.25, type: 'triangle', vol: 0.2, when: i * 0.18 }));
  },
  roar() {
    if (!state.sound) return;
    tone(160, { dur: 0.6, type: 'sawtooth', vol: 0.12, slide: 70, attack: 0.05 });
    noise({ dur: 0.6, vol: 0.18, freq: 500, q: 0.7 });
  },
  zap() {
    if (!state.sound) return;
    tone(1200, { dur: 0.15, type: 'square', vol: 0.06, slide: 2400 });
    tone(1568, { dur: 0.3, type: 'sine', vol: 0.18, when: 0.08 });
  },
  poof() {
    if (!state.sound) return;
    noise({ dur: 0.35, vol: 0.18, freq: 400, q: 0.6, type: 'lowpass' });
  },
  click() {
    if (!state.sound) return;
    tone(660, { dur: 0.05, type: 'sine', vol: 0.15 });
  },
};

// ---------- background music: a soft, looping pentatonic marimba tune ----------
let musicTimer = null;
let musicStep = 0;
let nextNoteTime = 0;
const TEMPO = 0.28; // seconds per step
const MELODY = [0, 2, 4, 2, 5, 4, 2, -1, 1, 3, 4, 3, 2, 1, 0, -1, 0, 2, 4, 5, 7, 5, 4, -1, 3, 2, 1, 2, 0, -1, -1, -1];
const BASS = [261.63, 261.63, 220, 220, 174.61, 174.61, 196, 196];

function startMusic() {
  if (!state.music || musicTimer) return;
  const c = ac();
  if (!c) return;
  nextNoteTime = c.currentTime + 0.1;
  musicTimer = setInterval(() => {
    while (nextNoteTime < c.currentTime + 0.3) {
      const step = musicStep % MELODY.length;
      const m = MELODY[step];
      const when = nextNoteTime - c.currentTime;
      if (m >= 0) tone(PENTA[m] / 2, { dur: 0.35, type: 'sine', vol: 0.5, when, out: musicGain });
      if (step % 4 === 0) tone(BASS[(step / 4) % BASS.length] / 2, { dur: 0.9, type: 'triangle', vol: 0.5, when, out: musicGain });
      musicStep++;
      nextNoteTime += TEMPO;
    }
  }, 100);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

// ---------- speech ----------
let preferredVoice = null;
function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return null;
  try {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const en = voices.filter((v) => /^en/i.test(v.lang));
    const nice = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Serena', 'Tessa', 'Fiona'];
    preferredVoice = nice.map((n) => en.find((v) => v.name.includes(n))).find(Boolean) || en[0] || null;
    return preferredVoice;
  } catch (e) {
    return null;
  }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
  try {
    window.speechSynthesis.onvoiceschanged = pickVoice;
  } catch (e) {
    // ignore
  }
}

/** Speak a short phrase. Interrupts anything already being said. */
function say(text, { rate = 0.95, pitch = 1.25, interrupt = true } = {}) {
  if (!state.voice || typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis || !text) return;
  try {
    if (interrupt) window.speechSynthesis.cancel();
    if (typeof SpeechSynthesisUtterance !== 'undefined') {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      const v = preferredVoice || pickVoice();
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
}

    Object.assign(exports, { unlockAudio, configureAudio, sfx, startMusic, stopMusic, say });
  });

  /* === Module: fx.js === */
  define("fx", function(exports, require) {
// Visual effects: star particles, confetti explosions, dust puffs, and gentle screen shakes.

const fxLayer = () => document.getElementById('fx-layer') || document.body;

const fx = {
  /**
   * Burst of colorful stars from a screen position (x, y) or element.
   */
  starBurst(x, y, count = 8) {
    const parent = fxLayer();
    const emojis = ['⭐', '✨', '🌟', '💛'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'fx-star';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const dist = 50 + Math.random() * 80;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 120;

      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--rot', `${rot}deg`);

      parent.appendChild(el);
      setTimeout(() => el.remove(), 850);
    }
  },

  /**
   * Confetti celebration for victory / dinosaur hatch.
   */
  confetti(count = 50) {
    const parent = fxLayer();
    const colors = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2', '#ffa94d'];
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.width = `${8 + Math.random() * 8}px`;
      el.style.height = `${10 + Math.random() * 12}px`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = '3px';
      el.style.left = `${Math.random() * w}px`;
      el.style.top = '-20px';
      el.style.zIndex = '50';
      el.style.pointerEvents = 'none';

      const duration = 1.8 + Math.random() * 1.6;
      const horizontalDrift = (Math.random() - 0.5) * 200;
      const spin = (Math.random() - 0.5) * 720;

      if (el.animate) {
        el.animate(
          [
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${horizontalDrift}px, ${window.innerHeight + 40}px) rotate(${spin}deg)`, opacity: 0.9 },
          ],
          {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }
        ).onfinish = () => el.remove();
      } else {
        setTimeout(() => el.remove(), 1000);
      }

      parent.appendChild(el);
    }
  },

  /**
   * Dust puff on dinosaur footsteps or egg crack.
   */
  dust(x, y) {
    const parent = fxLayer();
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = `${x - 12}px`;
    el.style.top = `${y - 12}px`;
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(200,200,200,0) 70%)';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '30';

    if (el.animate) {
      el.animate(
        [
          { transform: 'scale(0.4)', opacity: 0.8 },
          { transform: 'scale(2.2)', opacity: 0 },
        ],
        { duration: 450, easing: 'ease-out' }
      ).onfinish = () => el.remove();
    } else {
      setTimeout(() => el.remove(), 450);
    }

    parent.appendChild(el);
  },

  /**
   * Gentle screen nudge on wrong key.
   */
  shake(el = document.getElementById('stage')) {
    if (!el || !el.animate) return;
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 240, easing: 'ease-in-out' }
    );
  },
};

    Object.assign(exports, { fx });
  });

  /* === Module: keyboard-view.js === */
  define("keyboard-view", function(exports, require) {
// Keyboard & Hands visual component. Renders the interactive touch-typing
// keyboard and animated hands guide.
const { ROWS, FINGER_COLOR_VAR, keyFor, fingerHint, capLabel } = require("layout");

function handSVG(side) {
  const isLeft = side === 'left';
  // Finger IDs in left-to-right order on the illustration
  const fIds = isLeft ? ['L5', 'L4', 'L3', 'L2', 'TH'] : ['TH', 'R2', 'R3', 'R4', 'R5'];
  const fingerPaths = isLeft
    ? [
        // Left Pinky
        { id: 'L5', d: 'M12 75 Q10 40 16 35 Q22 40 22 75 Z', tip: [16, 35] },
        // Left Ring
        { id: 'L4', d: 'M25 70 Q24 22 32 18 Q40 22 40 70 Z', tip: [32, 18] },
        // Left Middle
        { id: 'L3', d: 'M44 68 Q44 10 52 8 Q60 10 60 68 Z', tip: [52, 8] },
        // Left Index
        { id: 'L2', d: 'M64 72 Q66 22 74 20 Q82 22 82 72 Z', tip: [74, 20] },
        // Left Thumb
        { id: 'TH', d: 'M84 85 Q98 62 102 68 Q96 95 86 100 Z', tip: [100, 65] },
      ]
    : [
        // Right Thumb
        { id: 'TH', d: 'M20 85 Q6 62 2 68 Q8 95 18 100 Z', tip: [4, 65] },
        // Right Index
        { id: 'R2', d: 'M22 72 Q20 22 28 20 Q36 22 38 72 Z', tip: [28, 20] },
        // Right Middle
        { id: 'R3', d: 'M42 68 Q42 10 50 8 Q58 10 58 68 Z', tip: [50, 8] },
        // Right Ring
        { id: 'R4', d: 'M62 70 Q62 22 70 18 Q78 22 77 70 Z', tip: [70, 18] },
        // Right Pinky
        { id: 'R5', d: 'M80 75 Q80 40 86 35 Q92 40 90 75 Z', tip: [86, 35] },
      ];

  const palmD = isLeft
    ? 'M14 74 Q52 68 86 80 L88 116 Q52 124 16 116 Z'
    : 'M16 80 Q50 68 88 74 L86 116 Q50 124 14 116 Z';

  const fingersMarkup = fingerPaths
    .map(({ id, d, tip }) => {
      const colVar = FINGER_COLOR_VAR[id];
      return `
      <g class="hand-finger" data-finger="${id}">
        <path d="${d}" fill="var(${colVar})" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
        <circle class="hand-finger-ring" cx="${tip[0]}" cy="${tip[1]}" r="8" fill="none" stroke="#ff9f43" stroke-width="3"/>
      </g>`;
    })
    .join('');

  return `
    <svg viewBox="0 0 104 125" xmlns="http://www.w3.org/2000/svg" aria-label="${side} hand">
      <ellipse cx="52" cy="120" rx="36" ry="5" fill="#000" opacity="0.1"/>
      <path d="${palmD}" fill="#fcd5b5" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      ${fingersMarkup}
      <text x="52" y="105" text-anchor="middle" font-size="11" font-weight="700" fill="#7a5538">${isLeft ? 'LEFT' : 'RIGHT'}</text>
    </svg>`;
}

class KeyboardView {
  constructor({ kbEl, leftHandEl, rightHandEl, hintEl, onKeyPress } = {}) {
    this.kbEl = kbEl;
    this.leftHandEl = leftHandEl;
    this.rightHandEl = rightHandEl;
    this.hintEl = hintEl;
    this.onKeyPress = onKeyPress;
    this.keyMap = new Map();
    this.render();
  }

  render() {
    if (this.leftHandEl) this.leftHandEl.innerHTML = handSVG('left');
    if (this.rightHandEl) this.rightHandEl.innerHTML = handSVG('right');

    if (!this.kbEl) return;
    this.kbEl.innerHTML = '';
    this.keyMap.clear();

    for (const row of ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      for (const [id, label, finger, units] of row) {
        const keyEl = document.createElement('button');
        keyEl.type = 'button';
        keyEl.className = `key ${id === ' ' ? 'space' : ''}`;
        keyEl.dataset.key = id;
        if (units) keyEl.dataset.units = units;
        keyEl.style.setProperty('--finger-color', `var(${FINGER_COLOR_VAR[finger]})`);
        keyEl.textContent = capLabel(label);

        // Tap/click support for tablet / mouse users
        let lastPress = 0;
        const triggerKey = (e) => {
          e.preventDefault();
          const now = Date.now();
          if (now - lastPress < 120) return;
          lastPress = now;
          this.flashPress(id);
          if (this.onKeyPress) {
            let ch = id;
            if (this.currentTargetShift && /^[a-z]$/.test(ch)) ch = ch.toUpperCase();
            this.onKeyPress(ch);
          }
        };

        keyEl.addEventListener('pointerdown', triggerKey);
        keyEl.addEventListener('click', triggerKey);

        rowEl.appendChild(keyEl);
        this.keyMap.set(id, keyEl);
      }
      this.kbEl.appendChild(rowEl);
    }
  }

  /**
   * Highlight target key, Shift key if required, and the corresponding finger.
   */
  highlight(ch) {
    this.clear();
    if (!ch) return;
    const info = keyFor(ch);
    if (!info) return;

    this.currentTargetShift = !!info.shift;

    // Highlight main key
    const el = this.keyMap.get(info.key);
    if (el) el.classList.add('target');

    // Highlight shift key if needed
    if (info.shift) {
      const shiftEl = this.keyMap.get(info.shift);
      if (shiftEl) shiftEl.classList.add('shift-needed');
    }

    // Highlight finger on hand
    const fingerId = info.finger;
    const handEl = fingerId.startsWith('L') ? this.leftHandEl : this.rightHandEl;
    if (handEl) {
      const f = handEl.querySelector(`.hand-finger[data-finger="${fingerId}"]`);
      if (f) f.classList.add('active');
    }

    // Also highlight shift hand finger if shifted
    if (info.shift) {
      const sHand = info.shift === 'ShiftLeft' ? this.leftHandEl : this.rightHandEl;
      if (sHand) {
        const sFinger = sHand.querySelector(`.hand-finger[data-finger="${info.shift === 'ShiftLeft' ? 'L5' : 'R5'}"]`);
        if (sFinger) sFinger.classList.add('active');
      }
    }

    // Update finger hint text
    if (this.hintEl) {
      const text = fingerHint(ch);
      const colVar = FINGER_COLOR_VAR[info.finger];
      this.hintEl.innerHTML = `<span class="finger-dot" style="background:var(${colVar})"></span> ${text}`;
    }
  }

  flashPress(key) {
    const el = this.keyMap.get(key) || this.keyMap.get(key.toLowerCase());
    if (el) {
      el.classList.add('pressed');
      setTimeout(() => el.classList.remove('pressed'), 140);
    }
  }

  clear() {
    this.currentTargetShift = false;
    if (this.kbEl) {
      this.kbEl.querySelectorAll('.key.target, .key.shift-needed').forEach((k) => {
        k.classList.remove('target', 'shift-needed');
      });
    }
    document.querySelectorAll('.hand-finger.active').forEach((f) => f.classList.remove('active'));
    if (this.hintEl) this.hintEl.textContent = '';
  }

  setVisible(showKb, showHands) {
    if (this.kbEl) this.kbEl.style.display = showKb ? '' : 'none';
    if (this.leftHandEl) this.leftHandEl.style.display = showHands ? '' : 'none';
    if (this.rightHandEl) this.rightHandEl.style.display = showHands ? '' : 'none';
  }
}

    Object.assign(exports, { KeyboardView });
  });

  /* === Module: game-modes.js === */
  define("game-modes", function(exports, require) {
const { TypingSession, normalizeKey } = require("engine");
const { dinoSVG, eggSVG, nestSVG, meteorSVG, playBallSVG, butterflySVG } = require("dino-art");
const { getDino } = require("dinos");
const { spokenName, capLabel } = require("layout");
const { sfx, say } = require("audio");
const { fx } = require("fx");

/** Base mode with common event dispatch and stats */
class ModeRunner {
  constructor({ stageEl, sceneCtrl, kbView, level, pool, content, buddy, onComplete, onProgress }) {
    this.stageEl = stageEl;
    this.sceneCtrl = sceneCtrl;
    this.kbView = kbView;
    this.level = level;
    this.pool = pool;
    this.content = content;
    this.buddy = getDino(buddy);
    this.onComplete = onComplete;
    this.onProgress = onProgress;
    this.destroyed = false;
  }

  destroy() {
    this.destroyed = true;
    this.stageEl.innerHTML = '';
    this.kbView.clear();
  }
}

/* ==========================================================================
   Mode 1: Hatch Mode (Egg in nest, 4-year-old friendly)
   ========================================================================== */
class HatchMode extends ModeRunner {
  start() {
    this.keys = Array.isArray(this.content) ? this.content : [...this.content];
    this.idx = 0;
    this.cracks = 0;
    this.errors = 0;
    this.correct = 0;
    this.total = this.keys.length;
    this.perKey = {};

    const rewardDino = this.level.reward ? getDino(this.level.reward) : this.buddy;

    this.stageEl.innerHTML = `
      <div class="hatch-stage">
        <div class="big-target-key" id="big-target"></div>
        <div class="hatch-nest-wrap">
          <div id="egg-container">${eggSVG({ color: rewardDino.belly, spot: rewardDino.accent })}</div>
          <div class="hatch-baby" id="hatch-baby">${dinoSVG(rewardDino)}</div>
          ${nestSVG()}
        </div>
      </div>
    `;

    this.eggEl = this.stageEl.querySelector('.egg');
    this.bigKeyEl = document.getElementById('big-target');
    this.babyEl = document.getElementById('hatch-baby');

    // Allow tapping/clicking the big target key directly
    let lastTapTime = 0;
    const onTapBigKey = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTapTime < 140) return;
      lastTapTime = now;
      if (this.keys && this.idx < this.total) {
        this.handleKey(this.keys[this.idx]);
      }
    };
    this.bigKeyEl?.addEventListener('pointerdown', onTapBigKey);
    this.bigKeyEl?.addEventListener('click', onTapBigKey);

    this.showNextKey(true);
  }

  showNextKey(isInitial = false) {
    if (this.destroyed) return;
    if (this.idx >= this.total) {
      this.finishHatch();
      return;
    }

    const currentKey = this.keys[this.idx];
    const isSpace = currentKey === ' ';

    if (this.bigKeyEl) {
      this.bigKeyEl.textContent = isSpace ? 'SPACE' : capLabel(currentKey);
      this.bigKeyEl.classList.toggle('space-bar', isSpace);
    }

    this.kbView.highlight(currentKey);

    // Voice prompt
    const name = spokenName(currentKey);
    const phrase = isInitial && this.level.intro ? this.level.intro : `Press ${name}`;
    say(phrase, { pitch: 1.3, rate: 0.9 });

    if (this.onProgress) {
      this.onProgress(this.idx / this.total, `${this.idx} / ${this.total}`);
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || this.idx >= this.total) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    const expected = this.keys[this.idx];
    const isHit = ch === expected;

    const kStats = (this.perKey[expected] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });

    if (isHit) {
      this.correct++;
      kStats.hits++;
      try { sfx.correct(this.idx); } catch (e) {}

      // Egg cracks & visual reactions (use setAttribute on SVGElement)
      this.cracks = Math.min(4, Math.floor(((this.idx + 1) / this.total) * 4));
      this.eggEl?.setAttribute('class', `egg crack-stage-${this.cracks} shake`);
      setTimeout(() => this.eggEl?.classList.remove('shake'), 320);

      try {
        if (this.bigKeyEl) {
          const r = this.bigKeyEl.getBoundingClientRect();
          fx.starBurst(r.left + r.width / 2, r.top + r.height / 2, 6);
        }
      } catch (e) {}
      try { sfx.crack(); } catch (e) {}

      this.idx++;
      setTimeout(() => this.showNextKey(), 280);
    } else {
      this.errors++;
      kStats.misses++;
      try { sfx.wrong(); } catch (e) {}
      try { if (this.bigKeyEl) fx.shake(this.bigKeyEl); } catch (e) {}
      try { say(`Try again. Find ${spokenName(expected)}!`); } catch (e) {}
    }
  }

  finishHatch() {
    this.kbView.clear();
    if (this.bigKeyEl) this.bigKeyEl.style.display = 'none';

    // Pop the egg open! (use setAttribute on SVGElement)
    this.eggEl?.setAttribute('class', 'egg hatched');
    try { sfx.hatch(); } catch (e) {}

    setTimeout(() => {
      if (this.babyEl) {
        this.babyEl.classList.add('show');
        const babySvg = this.babyEl.querySelector('.dino');
        babySvg?.classList.add('celebrating', 'roaring');
      }

      try { sfx.roar(); } catch (e) {}
      try { fx.confetti(60); } catch (e) {}

      try {
        if (this.babyEl) {
          const babyRect = this.babyEl.getBoundingClientRect();
          fx.starBurst(babyRect.left + babyRect.width / 2, babyRect.top + babyRect.height / 2, 12);
        }
      } catch (e) {}

      setTimeout(() => {
        if (this.onComplete) {
          this.onComplete({
            accuracy: 100, // hatch always succeeds for little ones
            wpm: 0,
            chars: this.total,
            errors: this.errors,
            elapsedMs: 12000,
            bestStreak: this.total,
            perKey: this.perKey,
          });
        }
      }, 2200);
    }, 450);
  }
}

/* ==========================================================================
   Mode 2: Trail Mode (Dinos run and play together as you type!)
   ========================================================================== */
class TrailMode extends ModeRunner {
  start() {
    this.text = typeof this.content === 'string' ? this.content : this.content.join(' ');
    this.session = new TypingSession(this.text);
    this.scrollPx = 0;
    this.energy = 0; // 0 to 100
    this.speedTier = 'idle';
    this.lastTypeTime = 0;
    this.ballTurn = 'right';

    // Pick a companion dinosaur friend to run and play with!
    const companionId = this.level.reward || (this.buddy.id === 'rexy' ? 'sunny' : (this.buddy.id === 'sunny' ? 'trixie' : 'rexy'));
    this.friendDino = getDino(companionId);

    this.stageEl.innerHTML = `
      <div class="trail-stage">
        <div class="speed-wind-lines" id="trail-wind"></div>
        <div class="dino-energy-gauge" id="dino-gauge">
          <div class="dino-energy-pill" id="dino-status">🐾 Walking</div>
          <div class="dino-energy-bar-wrap">
            <div class="dino-energy-bar-fill" id="dino-energy-fill"></div>
          </div>
          <div class="dino-streak-badge" id="dino-streak" style="display:none;">⚡ 0</div>
        </div>

        <div class="trail-play-area">
          <div class="trail-friend-wrap" id="trail-friend">
            ${dinoSVG(this.friendDino, { className: 'walking' })}
          </div>
          <div class="trail-ball-wrap" id="trail-ball">
            ${playBallSVG()}
          </div>
          <div class="trail-dino-wrap" id="trail-dino">
            ${dinoSVG(this.buddy, { className: 'walking' })}
          </div>
          <div class="trail-butterfly-wrap" id="trail-butterfly">
            ${butterflySVG()}
          </div>
        </div>

        <div class="text-stream" id="text-stream"></div>
      </div>
    `;

    this.dinoEl = this.stageEl.querySelector('#trail-dino');
    this.friendEl = this.stageEl.querySelector('#trail-friend');
    this.ballEl = this.stageEl.querySelector('#trail-ball');
    this.windEl = this.stageEl.querySelector('#trail-wind');
    this.gaugeEl = this.stageEl.querySelector('#dino-gauge');
    this.statusEl = this.stageEl.querySelector('#dino-status');
    this.energyFillEl = this.stageEl.querySelector('#dino-energy-fill');
    this.streakEl = this.stageEl.querySelector('#dino-streak');
    this.streamEl = this.stageEl.querySelector('#text-stream');

    this.dinoSvg = this.dinoEl?.querySelector('.dino');
    this.friendSvg = this.friendEl?.querySelector('.dino');

    this.renderTextStream();
    this.updateTarget();

    // Start energy & movement loop
    this.animLoop = requestAnimationFrame(() => this.tick());

    if (this.level.intro) {
      say(this.level.intro, { pitch: 1.25, rate: 0.95 });
    }
  }

  tick() {
    if (this.destroyed) return;
    const now = performance.now();
    const timeSinceType = now - this.lastTypeTime;

    // Smoothly decay energy when not typing
    if (timeSinceType > 700) {
      this.energy = Math.max(0, this.energy - 0.7);
    }

    this.updateEnergyVisuals();
    this.animLoop = requestAnimationFrame(() => this.tick());
  }

  updateEnergyVisuals() {
    if (this.energyFillEl) {
      this.energyFillEl.style.width = `${Math.min(100, Math.max(10, this.energy))}%`;
    }

    const streak = this.session.streak;
    if (this.streakEl) {
      if (streak >= 3) {
        this.streakEl.style.display = 'block';
        this.streakEl.textContent = `⚡ ${streak}`;
      } else {
        this.streakEl.style.display = 'none';
      }
    }

    // Determine speed state
    if (this.energy >= 55 || streak >= 10) {
      this.setSpeedTier('sprint');
    } else if (this.energy >= 22 || streak >= 4) {
      this.setSpeedTier('run');
    } else if (this.energy > 5) {
      this.setSpeedTier('walk');
    } else {
      this.setSpeedTier('idle');
    }
  }

  setSpeedTier(tier) {
    if (this.speedTier === tier) return;
    this.speedTier = tier;

    if (this.dinoSvg) {
      this.dinoSvg.classList.remove('idle-happy', 'walking', 'running', 'sprinting');
    }
    if (this.friendSvg) {
      this.friendSvg.classList.remove('idle-happy', 'walking', 'running', 'sprinting');
    }

    if (tier === 'sprint') {
      this.dinoSvg?.classList.add('sprinting');
      this.friendSvg?.classList.add('sprinting');
      this.windEl?.classList.add('active', 'sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill sprint';
      if (this.statusEl) this.statusEl.textContent = '🔥 SUPER SPRINT!';
      if (this.dinoEl) this.dinoEl.style.left = '32%';
      if (this.friendEl) this.friendEl.style.left = '16%';
    } else if (tier === 'run') {
      this.dinoSvg?.classList.add('running');
      this.friendSvg?.classList.add('running');
      this.windEl?.classList.add('active');
      this.windEl?.classList.remove('sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill run';
      if (this.statusEl) this.statusEl.textContent = '⚡ Running Fast!';
      if (this.dinoEl) this.dinoEl.style.left = '29%';
      if (this.friendEl) this.friendEl.style.left = '13%';
    } else if (tier === 'walk') {
      this.dinoSvg?.classList.add('walking');
      this.friendSvg?.classList.add('walking');
      this.windEl?.classList.remove('active', 'sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill';
      if (this.statusEl) this.statusEl.textContent = '🦖 Trotting';
      if (this.dinoEl) this.dinoEl.style.left = '26%';
      if (this.friendEl) this.friendEl.style.left = '10%';
    } else {
      this.dinoSvg?.classList.add('idle-happy');
      this.friendSvg?.classList.add('idle-happy');
      this.windEl?.classList.remove('active', 'sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill';
      if (this.statusEl) this.statusEl.textContent = '🐾 Ready to Play!';
      if (this.dinoEl) this.dinoEl.style.left = '26%';
      if (this.friendEl) this.friendEl.style.left = '10%';
    }
  }

  renderTextStream() {
    this.streamEl.innerHTML = '';
    const spanList = [];
    const len = this.text.length;
    // Show a sliding window of characters centered around current index
    const windowStart = Math.max(0, this.session.index - 5);
    const windowEnd = Math.min(len, windowStart + 16);

    for (let i = windowStart; i < windowEnd; i++) {
      const ch = this.text[i];
      const isSpace = ch === ' ';
      const span = document.createElement('span');
      span.className = `stone-char ${isSpace ? 'space' : ''}`;
      if (i < this.session.index) span.classList.add('completed');
      else if (i === this.session.index) span.classList.add('active');
      span.textContent = isSpace ? '␣' : ch;
      this.streamEl.appendChild(span);
      spanList.push(span);
    }
    this.activeSpan = spanList.find((s) => s.classList.contains('active'));
  }

  updateTarget() {
    if (this.destroyed || this.session.done) return;
    const cur = this.session.current;
    this.kbView.highlight(cur);
    this.renderTextStream();

    if (this.onProgress) {
      const st = this.session.stats();
      this.onProgress(this.session.progress, `${Math.round(st.wpm)} WPM · ${Math.round(st.accuracy)}%`);
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || this.session.done) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    const res = this.session.press(ch);
    this.kbView.flashPress(ch);

    if (res.type === 'correct') {
      this.lastTypeTime = performance.now();
      this.energy = Math.min(100, this.energy + 16);
      this.updateEnergyVisuals();

      sfx.correct(res.streak);
      sfx.step();

      // Parallax scroll accelerates with energy!
      const scrollSpeed = this.energy > 55 ? 42 : (this.energy > 20 ? 32 : 22);
      this.scrollPx += scrollSpeed;
      this.sceneCtrl.scrollTo(this.scrollPx);

      // Footstep dust puffs for both buddy and companion friend!
      if (this.dinoEl) {
        const dRect = this.dinoEl.getBoundingClientRect();
        fx.dust(dRect.left + 50, dRect.bottom - 10);
      }
      if (this.friendEl && res.streak % 2 === 0) {
        const fRect = this.friendEl.getBoundingClientRect();
        fx.dust(fRect.left + 40, fRect.bottom - 10);
      }

      // Ball toss / bounce between the two dinos!
      if (this.ballEl) {
        this.ballEl.classList.remove('kick-left', 'kick-right', 'high-bounce');
        void this.ballEl.offsetWidth; // trigger reflow
        if (res.streak > 0 && res.streak % 5 === 0) {
          this.ballEl.classList.add('high-bounce');
        } else {
          this.ballTurn = this.ballTurn === 'right' ? 'left' : 'right';
          this.ballEl.classList.add(this.ballTurn === 'right' ? 'kick-right' : 'kick-left');
        }
      }

      // Playful tricks & somersaults on streak milestones!
      if (res.streak > 0 && res.streak % 5 === 0) {
        this.triggerPlayTrick(res.streak);
      }

      if (this.activeSpan && res.streak % 4 === 0) {
        const sRect = this.activeSpan.getBoundingClientRect();
        fx.starBurst(sRect.left + sRect.width / 2, sRect.top + sRect.height / 2, 6);
      }

      if (res.done) {
        this.finishTrail();
      } else {
        this.updateTarget();
      }
    } else if (res.type === 'wrong') {
      sfx.wrong();
      this.energy = Math.max(0, this.energy - 12);
      this.updateEnergyVisuals();
      if (this.activeSpan) fx.shake(this.activeSpan);
      say(`Tap ${spokenName(res.expected)}`, { pitch: 1.2, rate: 1.0 });
    }
  }

  triggerPlayTrick(streak) {
    // Lead dino does a high joyful leap or 360 flip!
    if (this.dinoSvg) {
      const trickClass = streak >= 10 && streak % 10 === 0 ? 'flip' : 'leaping';
      this.dinoSvg.classList.add(trickClass);
      setTimeout(() => this.dinoSvg?.classList.remove(trickClass), 750);
    }

    // Companion dino hops playfully!
    if (this.friendSvg) {
      setTimeout(() => {
        this.friendSvg?.classList.add('leaping');
        setTimeout(() => this.friendSvg?.classList.remove('leaping'), 650);
      }, 120);
    }

    // Star burst and celebratory roar
    if (this.dinoEl) {
      const r = this.dinoEl.getBoundingClientRect();
      fx.starBurst(r.left + r.width / 2, r.top + 20, 8);
    }
    sfx.roar();
  }

  finishTrail() {
    this.kbView.clear();
    cancelAnimationFrame(this.animLoop);
    this.dinoSvg?.classList.remove('walking', 'running', 'sprinting', 'idle-happy');
    this.friendSvg?.classList.remove('walking', 'running', 'sprinting', 'idle-happy');
    this.dinoSvg?.classList.add('celebrating', 'roaring');
    this.friendSvg?.classList.add('celebrating');

    sfx.fanfare();
    fx.confetti(60);

    const st = this.session.stats();
    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete({
          ...st,
          perKey: this.session.tracker.keys,
        });
      }
    }, 1800);
  }

  destroy() {
    cancelAnimationFrame(this.animLoop);
    super.destroy();
  }
}

/* ==========================================================================
   Mode 3: Meteor Mode (Save the valley by zapping falling words/letters)
   ========================================================================== */
class MeteorMode extends ModeRunner {
  start() {
    this.words = Array.isArray(this.content) ? [...this.content] : this.content.split(' ');
    this.meteors = [];
    this.total = this.words.length;
    this.completedCount = 0;
    this.errors = 0;
    this.correctChars = 0;
    this.perKey = {};
    this.startedAt = performance.now();
    this.fallSec = this.level.fall || 12;
    this.spawnSec = this.level.spawn || 3.2;

    this.stageEl.innerHTML = `<div class="meteor-stage" id="meteor-field"></div>`;
    this.fieldEl = document.getElementById('meteor-field');

    this.spawnNext();
    this.spawnTimer = setInterval(() => this.spawnNext(), this.spawnSec * 1000);
    this.animLoop = requestAnimationFrame(() => this.tick());

    if (this.level.intro) say(this.level.intro, { pitch: 1.25, rate: 0.95 });
  }

  spawnNext() {
    if (this.destroyed || !this.words.length) return;
    const maxOnScreen = this.level.maxOnScreen || 3;
    if (this.meteors.length >= maxOnScreen) return;

    const word = this.words.shift();
    const el = document.createElement('div');
    el.className = 'meteor-item';
    el.innerHTML = `
      ${meteorSVG()}
      <div class="meteor-label">${word}</div>
    `;

    // Spread meteors across the horizontal viewport
    const pad = 120;
    const maxLeft = Math.max(100, window.innerWidth - pad * 2);
    const left = pad + Math.random() * maxLeft;
    el.style.left = `${left}px`;
    el.style.top = '-120px';

    this.fieldEl.appendChild(el);

    const meteor = {
      word,
      matched: 0,
      el,
      labelEl: el.querySelector('.meteor-label'),
      spawnTime: performance.now(),
      targetY: window.innerHeight - 170,
    };

    this.meteors.push(meteor);
    this.updateActiveMeteorTarget();
  }

  tick() {
    if (this.destroyed) return;
    const now = performance.now();
    const groundY = window.innerHeight - 160;

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      const elapsed = (now - m.spawnTime) / 1000;
      const progress = elapsed / this.fallSec;
      const y = -100 + progress * (groundY + 100);

      m.el.style.top = `${y}px`;

      // If a meteor touches ground, it harmlessly disintegrates into smoke and reappears in the queue
      if (y >= groundY) {
        sfx.poof();
        fx.dust(parseFloat(m.el.style.left) + 40, groundY);
        m.el.remove();
        this.meteors.splice(i, 1);
        this.words.push(m.word); // put back in queue so level is always completable
        this.updateActiveMeteorTarget();
      }
    }

    this.animLoop = requestAnimationFrame(() => this.tick());
  }

  updateActiveMeteorTarget() {
    if (this.destroyed) return;
    this.meteors.forEach((m) => m.el.classList.remove('active-target'));
    const target = this.meteors[0];
    if (target) {
      target.el.classList.add('active-target');
      const nextChar = target.word[target.matched];
      this.kbView.highlight(nextChar);
    } else {
      this.kbView.clear();
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || !this.meteors.length) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    this.kbView.flashPress(ch);

    const m = this.meteors[0];
    const expected = m.word[m.matched];
    const isHit = ch === expected;

    const kStats = (this.perKey[expected] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });

    if (isHit) {
      this.correctChars++;
      kStats.hits++;
      sfx.correct(m.matched);
      m.matched++;

      // Highlight matched letters in green
      const matchedPart = m.word.slice(0, m.matched);
      const remainingPart = m.word.slice(m.matched);
      m.labelEl.innerHTML = `<span class="meteor-matched">${matchedPart}</span>${remainingPart}`;

      if (m.matched >= m.word.length) {
        // Zapped the meteor!
        sfx.zap();
        const r = m.el.getBoundingClientRect();
        fx.starBurst(r.left + r.width / 2, r.top + r.height / 2, 10);
        m.el.remove();
        this.meteors.shift();
        this.completedCount++;

        if (this.onProgress) {
          this.onProgress(this.completedCount / this.total, `${this.completedCount} / ${this.total}`);
        }

        if (this.completedCount >= this.total) {
          this.finishMeteor();
          return;
        }
      }
      this.updateActiveMeteorTarget();
    } else {
      this.errors++;
      kStats.misses++;
      sfx.wrong();
      if (m) fx.shake(m.labelEl);
    }
  }

  finishMeteor() {
    clearInterval(this.spawnTimer);
    cancelAnimationFrame(this.animLoop);
    this.kbView.clear();

    fx.confetti(40);
    sfx.fanfare();

    const elapsedMs = performance.now() - this.startedAt;
    const totalChars = this.correctChars + this.errors;
    const accuracy = totalChars ? (this.correctChars / totalChars) * 100 : 100;

    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete({
          accuracy,
          wpm: (this.correctChars / 5) / (elapsedMs / 60000),
          chars: this.correctChars,
          errors: this.errors,
          elapsedMs,
          bestStreak: this.total,
          perKey: this.perKey,
        });
      }
    }, 1200);
  }

  destroy() {
    clearInterval(this.spawnTimer);
    cancelAnimationFrame(this.animLoop);
    super.destroy();
  }
}

/* ==========================================================================
   Mode 4: Race Mode (Race against Zip the pterodactyl)
   ========================================================================== */
class RaceMode extends ModeRunner {
  start() {
    this.text = typeof this.content === 'string' ? this.content : this.content.join(' ');
    this.session = new TypingSession(this.text);
    this.targetWpm = this.level.targetWpm || 20;

    const zipDino = getDino('petra'); // rival pterodactyl

    this.stageEl.innerHTML = `
      <div class="race-stage">
        <div class="race-track">
          <div class="race-lane" id="lane-player">
            <div class="racer" id="racer-player">${dinoSVG(this.buddy, { className: 'flying walking' })}</div>
            <div class="race-finish-line"></div>
          </div>
          <div class="race-lane" id="lane-rival">
            <div class="racer" id="racer-rival">${dinoSVG(zipDino, { className: 'flying walking' })}</div>
            <div class="race-finish-line"></div>
          </div>
        </div>
        <div class="text-stream" id="text-stream"></div>
      </div>
    `;

    this.racerPlayer = document.getElementById('racer-player');
    this.racerRival = document.getElementById('racer-rival');
    this.streamEl = document.getElementById('text-stream');

    this.renderTextStream();
    this.updateTarget();

    // Start rival timer once first character is typed
    this.rivalStarted = false;
    this.rivalProgress = 0;
    this.rivalAnim = requestAnimationFrame(() => this.tickRival());

    if (this.level.intro) say(this.level.intro, { pitch: 1.25, rate: 0.95 });
  }

  tickRival() {
    if (this.destroyed) return;
    if (this.session.startedAt) {
      const elapsedSec = (performance.now() - this.session.startedAt) / 1000;
      const targetCps = (this.targetWpm * 5) / 60;
      this.rivalProgress = Math.min(0.96, (elapsedSec * targetCps) / this.text.length);

      const maxPx = this.racerRival.parentElement.clientWidth - 80;
      this.racerRival.style.left = `${this.rivalProgress * maxPx}px`;
    }
    this.rivalAnim = requestAnimationFrame(() => this.tickRival());
  }

  renderTextStream() {
    this.streamEl.innerHTML = '';
    const spanList = [];
    const len = this.text.length;
    const windowStart = Math.max(0, this.session.index - 5);
    const windowEnd = Math.min(len, windowStart + 16);

    for (let i = windowStart; i < windowEnd; i++) {
      const ch = this.text[i];
      const isSpace = ch === ' ';
      const span = document.createElement('span');
      span.className = `stone-char ${isSpace ? 'space' : ''}`;
      if (i < this.session.index) span.classList.add('completed');
      else if (i === this.session.index) span.classList.add('active');
      span.textContent = isSpace ? '␣' : ch;
      this.streamEl.appendChild(span);
      spanList.push(span);
    }
    this.activeSpan = spanList.find((s) => s.classList.contains('active'));
  }

  updateTarget() {
    if (this.destroyed || this.session.done) return;
    this.kbView.highlight(this.session.current);
    this.renderTextStream();

    const maxPx = this.racerPlayer.parentElement.clientWidth - 80;
    this.racerPlayer.style.left = `${this.session.progress * maxPx}px`;

    if (this.onProgress) {
      const st = this.session.stats();
      this.onProgress(this.session.progress, `${Math.round(st.wpm)} WPM (Goal: ${this.targetWpm})`);
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || this.session.done) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    const res = this.session.press(ch);
    this.kbView.flashPress(ch);

    if (res.type === 'correct') {
      sfx.correct(res.streak);
      if (res.done) {
        this.finishRace();
      } else {
        this.updateTarget();
      }
    } else if (res.type === 'wrong') {
      sfx.wrong();
      if (this.activeSpan) fx.shake(this.activeSpan);
    }
  }

  finishRace() {
    cancelAnimationFrame(this.rivalAnim);
    this.kbView.clear();

    const won = this.session.progress >= this.rivalProgress;
    if (won) {
      sfx.fanfare();
      fx.confetti(60);
    } else {
      sfx.tryAgain();
    }

    const st = this.session.stats();
    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete({
          ...st,
          perKey: this.session.tracker.keys,
        });
      }
    }, 1600);
  }

  destroy() {
    cancelAnimationFrame(this.rivalAnim);
    super.destroy();
  }
}

    Object.assign(exports, { HatchMode, TrailMode, MeteorMode, RaceMode });
  });

  /* === Module: main.js === */
  define("main", function(exports, require) {
// Main application coordinator for Dino Keys.
const { Store, totalStars } = require("storage");
const { WORLDS, LEVELS, getLevel, poolFor, isUnlocked, currentLevel, starsFor, nextLevel, START_OPTIONS } = require("curriculum");
const { buildContent, mulberry32 } = require("textgen");
const { weightsFromKeyStats, trickyKeys } = require("engine");
const { dinoSVG } = require("dino-art");
const { DINOS, getDino, SPECIES_NAMES } = require("dinos");
const { renderScene, renderStaticScenes } = require("scene");
const { KeyboardView } = require("keyboard-view");
const { HatchMode, TrailMode, MeteorMode, RaceMode } = require("game-modes");
const { unlockAudio, configureAudio, startMusic, sfx, say } = require("audio");
const { fx } = require("fx");

class App {
  constructor() {
    this.store = new Store();
    this.activeMode = null;
    this.currentLevelId = null;

    this.initDOM();
    this.initKeyboard();
    this.initEvents();
    this.setupInitialScreen();
  }

  initDOM() {
    this.screens = {
      title: document.getElementById('screen-title'),
      profiles: document.getElementById('screen-profiles'),
      newplayer: document.getElementById('screen-newplayer'),
      map: document.getElementById('screen-map'),
      game: document.getElementById('screen-game'),
      results: document.getElementById('screen-results'),
      collection: document.getElementById('screen-collection'),
      parents: document.getElementById('screen-parents'),
    };

    // Render title dino
    const titleDinoEl = document.getElementById('title-dino');
    if (titleDinoEl) {
      titleDinoEl.innerHTML = dinoSVG('rexy', { className: 'celebrating' });
    }

    renderStaticScenes();
  }

  initKeyboard() {
    this.kbView = new KeyboardView({
      kbEl: document.getElementById('keyboard'),
      leftHandEl: document.getElementById('hand-left'),
      rightHandEl: document.getElementById('hand-right'),
      hintEl: document.getElementById('finger-hint'),
      onKeyPress: (ch) => {
        if (this.activeMode) this.activeMode.handleKey(ch);
      },
    });
  }

  initEvents() {
    // Physical keyboard input
    window.addEventListener('keydown', (e) => {
      // Space or Enter on title screen starts game
      if (this.currentScreen === 'title' && (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        this.handleStartPlay();
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (this.activeMode) {
        if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space' || e.key === 'Backspace' || e.key.length === 1) {
          e.preventDefault();
        }
        const k = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') ? ' ' : e.key;
        this.activeMode.handleKey(k);
      }
    });

    // Navigation buttons
    const startBtn = document.getElementById('btn-start');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleStartPlay();
      });
      startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleStartPlay();
      });
    }
    document.getElementById('title-dino')?.addEventListener('click', () => this.handleStartPlay());
    document.getElementById('btn-quit')?.addEventListener('click', () => {
      sfx.click();
      this.showScreen('map');
    });
    document.getElementById('btn-collection')?.addEventListener('click', () => {
      sfx.click();
      this.renderCollection();
      this.showScreen('collection');
    });
    document.getElementById('map-buddy')?.addEventListener('click', () => {
      sfx.click();
      this.renderCollection();
      this.showScreen('collection');
    });
    document.getElementById('btn-switch')?.addEventListener('click', () => {
      sfx.click();
      this.renderProfiles();
      this.showScreen('profiles');
    });
    document.getElementById('btn-parents')?.addEventListener('click', () => {
      sfx.click();
      this.renderParents();
      this.showScreen('parents');
    });
    document.getElementById('btn-practice')?.addEventListener('click', () => {
      sfx.click();
      this.startPractice();
    });

    // Generic back button handler
    document.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.click();
        this.showScreen(btn.dataset.back);
      });
    });
  }

  showScreen(name) {
    this.currentScreen = name;
    if (this.activeMode && name !== 'game') {
      this.activeMode.destroy();
      this.activeMode = null;
    }

    Object.entries(this.screens).forEach(([id, el]) => {
      el.classList.toggle('active', id === name);
    });

    if (name === 'map') this.renderMap();
  }

  toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
  }

  setupInitialScreen() {
    this.showScreen('title');
  }

  handleStartPlay() {
    unlockAudio();
    sfx.click();

    const p = this.store.current;
    if (!p) {
      if (this.store.profiles.length > 0) {
        this.renderProfiles();
        this.showScreen('profiles');
      } else {
        this.renderNewPlayerForm();
        this.showScreen('newplayer');
      }
    } else {
      this.syncSettings();
      this.renderMap();
      this.showScreen('map');
    }
  }

  syncSettings() {
    const p = this.store.current;
    if (!p) return;
    configureAudio(p.settings);
    if (p.settings.music) startMusic();
    this.kbView.setVisible(p.settings.keyboard, p.settings.hands);
  }

  /* ==========================================================================
     Profiles & New Player
     ========================================================================== */
  renderProfiles() {
    const listEl = document.getElementById('profile-list');
    listEl.innerHTML = '';

    for (const p of this.store.profiles) {
      const buddy = getDino(p.buddy);
      const stars = totalStars(p);
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.innerHTML = `
        <div class="profile-avatar">${dinoSVG(buddy)}</div>
        <div class="profile-name">${p.name}</div>
        <div class="profile-stars">⭐ ${stars}</div>
      `;
      card.addEventListener('click', () => {
        sfx.click();
        this.store.select(p.id);
        this.syncSettings();
        this.showScreen('map');
      });
      listEl.appendChild(card);
    }

    // Add Player card
    const addCard = document.createElement('div');
    addCard.className = 'profile-card';
    addCard.style.borderStyle = 'dashed';
    addCard.innerHTML = `
      <div style="font-size:3.5rem; margin: 10px 0;">🐣</div>
      <div class="profile-name" style="color:var(--green)">+ New Player</div>
    `;
    addCard.addEventListener('click', () => {
      sfx.click();
      this.renderNewPlayerForm();
      this.showScreen('newplayer');
    });
    listEl.appendChild(addCard);
  }

  renderNewPlayerForm() {
    const panel = document.getElementById('newplayer-panel');
    panel.innerHTML = `
      <h2>Welcome to Dino Keys!</h2>
      <p class="sub">Pick a name and starting spot:</p>
      <div style="margin: 18px 0;">
        <input type="text" id="np-name" placeholder="Child's Name" maxlength="14"
          style="font-size:1.4rem; padding:10px 20px; border-radius:999px; border:2px solid #ccc; font-family:inherit; text-align:center; width:min(280px,80vw);">
      </div>
      <div class="placement-options" id="np-options"></div>
      <div style="display:flex; justify-content:center; gap:14px; margin-top:20px;">
        ${this.store.profiles.length > 0 ? `<button class="btn" id="np-cancel">Cancel</button>` : ''}
        <button class="btn big primary" id="np-create">Start Adventure!</button>
      </div>
    `;

    let selectedWorld = 0;
    const optContainer = panel.querySelector('#np-options');
    START_OPTIONS.forEach((opt) => {
      const div = document.createElement('div');
      div.className = `placement-opt ${opt.world === selectedWorld ? 'selected' : ''}`;
      div.innerHTML = `
        <div class="placement-opt-head"><span>${opt.emoji}</span><span>${opt.title}</span></div>
        <div class="placement-opt-desc">${opt.desc}</div>
      `;
      div.addEventListener('click', () => {
        sfx.click();
        selectedWorld = opt.world;
        optContainer.querySelectorAll('.placement-opt').forEach((o) => o.classList.remove('selected'));
        div.classList.add('selected');
      });
      optContainer.appendChild(div);
    });

    const nameInput = panel.querySelector('#np-name');
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        panel.querySelector('#np-create')?.click();
      }
    });
    setTimeout(() => nameInput?.focus(), 100);

    panel.querySelector('#np-create').addEventListener('click', () => {
      const name = panel.querySelector('#np-name').value.trim() || 'Little Dino';
      this.store.createProfile({ name, startWorld: selectedWorld });
      this.syncSettings();
      this.showScreen('map');
      say(`Welcome to Dino Keys, ${name}!`);
    });

    panel.querySelector('#np-cancel')?.addEventListener('click', () => {
      sfx.click();
      this.renderProfiles();
      this.showScreen('profiles');
    });
  }

  /* ==========================================================================
     World Map Screen
     ========================================================================== */
  renderMap() {
    const p = this.store.current;
    if (!p) return;

    const buddy = getDino(p.buddy);
    const buddyBtn = document.getElementById('map-buddy');
    buddyBtn.innerHTML = `
      <div class="buddy-chip-avatar">${dinoSVG(buddy)}</div>
      <span>${buddy.name}</span>
    `;

    document.getElementById('map-player').textContent = p.name;
    document.getElementById('map-stars').textContent = `⭐ ${totalStars(p)}`;

    const scrollEl = document.getElementById('map-scroll');
    scrollEl.innerHTML = '';

    const opts = { startWorld: p.startWorld, unlockAll: p.settings.unlockAll };
    const curLvl = currentLevel(p.levels, opts);

    const worldThemes = {
      nest: '#ff922b',
      meadow: '#51cf66',
      jungle: '#20c997',
      volcano: '#ff6b6b',
      canyon: '#fcc419',
      mountain: '#339af0',
      sky: '#845ef7',
    };

    WORLDS.forEach((world) => {
      const card = document.createElement('div');
      card.className = 'world-card';
      const col = worldThemes[world.id] || '#5cc46f';
      card.style.setProperty('--theme-color', col);

      const levelNodesHtml = world.levels
        .map((lvl) => {
          const unlocked = isUnlocked(lvl.id, p.levels, opts);
          const isCurrent = curLvl && curLvl.id === lvl.id;
          const starsEarned = p.levels[lvl.id]?.stars || 0;
          const starsStr = '⭐'.repeat(starsEarned);
          const rewardIcon = lvl.reward ? (starsEarned > 0 ? '🦕' : '🥚') : '';

          return `
          <div class="level-node ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}"
               data-level-id="${lvl.id}"
               title="${lvl.title}">
            ${rewardIcon ? `<span class="level-reward-icon">${rewardIcon}</span>` : ''}
            <div class="level-num">${lvl.indexInWorld + 1}</div>
            <div class="level-stars">${starsStr}</div>
          </div>
        `;
        })
        .join('');

      card.innerHTML = `
        <div class="world-head">
          <div class="world-title-wrap">
            <h3>${world.name}</h3>
            <p class="world-blurb">${world.ages} · ${world.blurb}</p>
          </div>
        </div>
        <div class="world-levels">${levelNodesHtml}</div>
      `;

      card.querySelectorAll('.level-node.unlocked').forEach((node) => {
        node.addEventListener('click', () => {
          sfx.click();
          this.startLevel(node.dataset.levelId);
        });
      });

      scrollEl.appendChild(card);
    });

    // Auto-scroll so current level is visible
    setTimeout(() => {
      const curEl = scrollEl.querySelector('.level-node.current');
      if (curEl) curEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  /* ==========================================================================
     Start Level & Gameplay
     ========================================================================== */
  startLevel(levelId) {
    const level = getLevel(levelId);
    if (!level) return;
    this.currentLevelId = levelId;

    const p = this.store.current;
    const pool = poolFor(levelId);
    const weights = weightsFromKeyStats(p.keyStats);
    const content = buildContent(level, pool, { rng: mulberry32(Date.now()), weights });

    this.showScreen('game');

    // Setup themed scene
    const sceneHost = document.getElementById('game-scene');
    sceneHost.innerHTML = '';
    const sceneCtrl = renderScene(sceneHost, level.worldId);

    // Setup HUD
    document.getElementById('hud-title').textContent = `${level.title}`;
    const fill = document.getElementById('hud-progress');
    fill.style.width = '0%';
    const statPill = document.getElementById('hud-stat');
    statPill.textContent = '';

    const stageEl = document.getElementById('stage');

    const commonOpts = {
      stageEl,
      sceneCtrl,
      kbView: this.kbView,
      level,
      pool,
      content,
      buddy: p.buddy,
      onProgress: (ratio, statText) => {
        fill.style.width = `${Math.round(ratio * 100)}%`;
        if (statText) statPill.textContent = statText;
      },
      onComplete: (stats) => this.handleLevelComplete(level, stats),
    };

    switch (level.mode) {
      case 'hatch':
        this.activeMode = new HatchMode(commonOpts);
        break;
      case 'trail':
        this.activeMode = new TrailMode(commonOpts);
        break;
      case 'meteor':
        this.activeMode = new MeteorMode(commonOpts);
        break;
      case 'race':
        this.activeMode = new RaceMode(commonOpts);
        break;
      default:
        console.error('Unknown mode', level.mode);
        return;
    }

    this.activeMode.start();
  }

  startPractice() {
    const p = this.store.current;
    if (!p) return;
    const tricky = trickyKeys(p.keyStats, 5);

    // Create custom practice drill
    const practiceLevel = {
      id: 'practice',
      title: 'Tricky Keys Practice 🎯',
      worldId: 'meadow',
      mode: 'trail',
      newKeys: tricky.length ? tricky : ['f', 'j', 'd', 'k'],
      length: 28,
      minAcc: 60,
      intro: tricky.length
        ? `Let's practice your tricky keys: ${tricky.map(capLabel).join(', ')}!`
        : 'Nice and easy practice on the home row!',
    };

    this.currentLevelId = 'practice';
    const pool = tricky.length ? [...new Set([...tricky, ' '])] : ['f', 'j', 'd', 'k', ' '];
    const content = buildContent(
      { content: 'drill', length: 28, newKeys: tricky },
      pool,
      { rng: mulberry32(Date.now()), weights: weightsFromKeyStats(p.keyStats) }
    );

    this.showScreen('game');
    const sceneHost = document.getElementById('game-scene');
    sceneHost.innerHTML = '';
    const sceneCtrl = renderScene(sceneHost, 'meadow');

    document.getElementById('hud-title').textContent = practiceLevel.title;
    const fill = document.getElementById('hud-progress');
    fill.style.width = '0%';
    const statPill = document.getElementById('hud-stat');
    statPill.textContent = '';

    this.activeMode = new TrailMode({
      stageEl: document.getElementById('stage'),
      sceneCtrl,
      kbView: this.kbView,
      level: practiceLevel,
      pool,
      content,
      buddy: p.buddy,
      onProgress: (ratio, statText) => {
        fill.style.width = `${Math.round(ratio * 100)}%`;
        if (statText) statPill.textContent = statText;
      },
      onComplete: (stats) => {
        this.store.recordPractice({ stats, perKey: stats.perKey });
        this.showResultsPanel(practiceLevel, 3, stats, { newDino: null });
      },
    });

    this.activeMode.start();
  }

  /* ==========================================================================
     Level Complete & Results Screen
     ========================================================================== */
  handleLevelComplete(level, stats) {
    const stars = starsFor(level, stats);
    let record = { firstClear: false, newBest: false, newDino: null };

    if (level.id !== 'practice') {
      record = this.store.recordResult(level.id, {
        stars,
        stats,
        perKey: stats.perKey || {},
      });
    }

    this.showResultsPanel(level, stars, stats, record);
  }

  showResultsPanel(level, stars, stats, record) {
    this.showScreen('results');

    // Background scene for results
    const sceneHost = document.getElementById('results-scene');
    sceneHost.innerHTML = '';
    renderScene(sceneHost, level.worldId || 'meadow', { drift: true });

    const p = this.store.current;
    const nxt = nextLevel(level.id);

    const panel = document.getElementById('results-panel');
    const newDino = record.newDino ? getDino(record.newDino) : null;

    panel.innerHTML = `
      <h2>${stars > 0 ? 'Awesome Job! 🌟' : 'Good Try!'}</h2>
      <div class="results-stars" id="res-stars">
        <span class="results-star" id="star-1">⭐</span>
        <span class="results-star" id="star-2">⭐</span>
        <span class="results-star" id="star-3">⭐</span>
      </div>

      ${
        newDino
          ? `
        <div class="reward-banner">
          <div class="reward-dino-wrap">${dinoSVG(newDino, { className: 'celebrating' })}</div>
          <div style="text-align:left;">
            <div style="font-size:1.35rem; font-weight:700;">Hatched ${newDino.name}!</div>
            <div style="font-size:0.95rem; color:#6d4c41;">A friendly ${SPECIES_NAMES[newDino.species]} joined you!</div>
          </div>
        </div>
      `
          : ''
      }

      <div class="results-stats">
        <div class="stat-box"><div class="stat-val">${Math.round(stats.accuracy)}%</div><div class="stat-lbl">Accuracy</div></div>
        <div class="stat-box"><div class="stat-val">${Math.round(stats.wpm)}</div><div class="stat-lbl">Words/Min</div></div>
        <div class="stat-box"><div class="stat-val">${stats.bestStreak || stats.chars || 0}</div><div class="stat-lbl">Best Streak</div></div>
      </div>

      <div class="results-actions">
        <button class="btn" id="res-map">🗺️ World Map</button>
        <button class="btn" id="res-retry">🔄 Try Again</button>
        ${
          nxt && stars > 0
            ? `<button class="btn primary big" id="res-next" style="padding:14px 34px; font-size:1.35rem;">▶ Next Level</button>`
            : ''
        }
      </div>
    `;

    // Star pop-in animation with musical chimes
    for (let i = 1; i <= 3; i++) {
      const starEl = panel.querySelector(`#star-${i}`);
      if (i <= stars) {
        setTimeout(() => {
          starEl.classList.add('show');
          sfx.star(i - 1);
          const r = starEl.getBoundingClientRect();
          fx.starBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
        }, i * 360);
      } else {
        starEl.style.opacity = '0.2';
        starEl.style.transform = 'scale(0.8)';
      }
    }

    if (stars > 0) {
      setTimeout(() => sfx.fanfare(), 1200);
    } else {
      setTimeout(() => sfx.tryAgain(), 500);
    }

    panel.querySelector('#res-map').addEventListener('click', () => {
      sfx.click();
      this.showScreen('map');
    });
    panel.querySelector('#res-retry').addEventListener('click', () => {
      sfx.click();
      this.startLevel(level.id);
    });
    panel.querySelector('#res-next')?.addEventListener('click', () => {
      sfx.click();
      this.startLevel(nxt.id);
    });
  }

  /* ==========================================================================
     Dino Collection Screen
     ========================================================================== */
  renderCollection() {
    const p = this.store.current;
    if (!p) return;

    const grid = document.getElementById('dino-grid');
    grid.innerHTML = '';

    DINOS.forEach((d) => {
      const unlocked = p.dinos.includes(d.id);
      const isBuddy = p.buddy === d.id;

      const card = document.createElement('div');
      card.className = `dino-card ${unlocked ? '' : 'locked'} ${isBuddy ? 'is-buddy' : ''}`;
      card.innerHTML = `
        <div class="dino-card-art">${dinoSVG(d, { className: isBuddy ? 'celebrating' : '' })}</div>
        <div class="dino-card-name">${unlocked ? d.name : '???'}</div>
        <div class="dino-card-species">${SPECIES_NAMES[d.species]}</div>
        ${isBuddy ? `<div class="dino-buddy-tag">Buddy!</div>` : ''}
      `;

      if (unlocked) {
        card.addEventListener('click', () => {
          sfx.roar();
          this.store.setBuddy(d.id);
          this.toast(`${d.name} is now your buddy! 🦖`);
          this.renderCollection();
        });
      }

      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     Parent Dashboard / Settings
     ========================================================================== */
  renderParents() {
    const p = this.store.current;
    if (!p) return;

    const panel = document.getElementById('parents-panel');
    const tricky = trickyKeys(p.keyStats, 8);
    const minutes = Math.round((p.totals.ms || 0) / 60000);

    panel.innerHTML = `
      <div class="panel-head">
        <button class="btn small icon" data-back="map">⬅</button>
        <h2>Grown-ups & Settings</h2>
      </div>
      <p class="sub">Progress summary for <strong>${p.name}</strong></p>

      <div class="results-stats">
        <div class="stat-box"><div class="stat-val">${p.totals.plays || 0}</div><div class="stat-lbl">Sessions Played</div></div>
        <div class="stat-box"><div class="stat-val">${p.totals.chars || 0}</div><div class="stat-lbl">Keys Typed</div></div>
        <div class="stat-box"><div class="stat-val">${minutes}m</div><div class="stat-lbl">Time Practiced</div></div>
        <div class="stat-box"><div class="stat-val">${p.dinos.length} / ${DINOS.length}</div><div class="stat-lbl">Dinos Found</div></div>
      </div>

      <div class="settings-group">
        <h3>Keys to Practice</h3>
        ${
          tricky.length
            ? `<div class="tricky-keys-wrap">${tricky.map((k) => `<span class="tricky-pill">${capLabel(k)}</span>`).join('')}</div>`
            : `<p style="margin:0; color:var(--ink-soft);">No tricky keys yet! Everything looks great.</p>`
        }
      </div>

      <div class="settings-group">
        <h3>Audio & Voice</h3>
        <div class="settings-row">
          <span>Sound Effects</span>
          <label class="switch"><input type="checkbox" id="set-sound" ${p.settings.sound ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Spoken Voice Prompts</span>
          <label class="switch"><input type="checkbox" id="set-voice" ${p.settings.voice ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Background Music</span>
          <label class="switch"><input type="checkbox" id="set-music" ${p.settings.music ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>

      <div class="settings-group">
        <h3>Display & Helpers</h3>
        <div class="settings-row">
          <span>On-screen Keyboard</span>
          <label class="switch"><input type="checkbox" id="set-kb" ${p.settings.keyboard ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Finger Guide Hands</span>
          <label class="switch"><input type="checkbox" id="set-hands" ${p.settings.hands ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Unlock All Levels (Skip Ahead)</span>
          <label class="switch"><input type="checkbox" id="set-unlock" ${p.settings.unlockAll ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
        <button class="btn danger small" id="btn-reset">Reset Player Progress</button>
        <button class="btn primary" data-back="map">Done</button>
      </div>
    `;

    // Bind toggles
    const bindToggle = (id, key) => {
      panel.querySelector(`#${id}`).addEventListener('change', (e) => {
        this.store.updateSettings({ [key]: e.target.checked });
        this.syncSettings();
      });
    };
    bindToggle('set-sound', 'sound');
    bindToggle('set-voice', 'voice');
    bindToggle('set-music', 'music');
    bindToggle('set-kb', 'keyboard');
    bindToggle('set-hands', 'hands');
    bindToggle('set-unlock', 'unlockAll');

    // Reset button
    panel.querySelector('#btn-reset').addEventListener('click', () => {
      if (confirm(`Reset all progress for ${p.name}? This will clear completed levels.`)) {
        this.store.resetProgress();
        this.toast('Progress reset.');
        this.renderParents();
      }
    });

    panel.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.click();
        this.showScreen(btn.dataset.back);
      });
    });
  }
}

// Start app on load
function startApp() {
  if (!window.dinoApp) {
    try {
      window.dinoApp = new App();
    } catch (err) {
      console.error('Failed to initialize Dino Keys App:', err);
    }
  }
}

if (document.getElementById('screen-title')) {
  startApp();
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
window.addEventListener('load', startApp);

  });

  // Initialize entry point
  require("main");
})();
