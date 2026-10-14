// Keyboard layout (US QWERTY) and touch-typing finger assignments.
// Pure data + helpers so it can be unit tested in node.

/** Finger ids, left pinky → right pinky, plus thumbs. */
export const FINGERS = ['L5', 'L4', 'L3', 'L2', 'TH', 'R2', 'R3', 'R4', 'R5'];

export const FINGER_NAMES = {
  L5: 'left pinky', L4: 'left ring finger', L3: 'left middle finger', L2: 'left pointer finger',
  TH: 'thumb',
  R2: 'right pointer finger', R3: 'right middle finger', R4: 'right ring finger', R5: 'right pinky',
};

/** CSS variable used for each finger's colour. */
export const FINGER_COLOR_VAR = {
  L5: '--f-pinky', L4: '--f-ring', L3: '--f-middle', L2: '--f-index-l', TH: '--f-thumb',
  R2: '--f-index-r', R3: '--f-middle', R4: '--f-ring', R5: '--f-pinky',
};

/**
 * Rows of the on-screen keyboard. Each key: [id, label, finger, widthUnits].
 * `id` is the unshifted character for printable keys, or a name for special keys.
 */
export const ROWS = [
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

export const HOME_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

/** Shifted characters → the unshifted key that produces them. */
export const SHIFTED = {
  '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
};

const FINGER_OF = {};
for (const row of ROWS) for (const [id, , finger] of row) FINGER_OF[id] = finger;

/**
 * Describe how to type a character.
 * @returns {{key: string, finger: string, shift: null|'ShiftLeft'|'ShiftRight'} | null}
 */
export function keyFor(ch) {
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

export function fingerFor(ch) {
  const k = keyFor(ch);
  return k ? k.finger : null;
}

/** True when `ch` needs a Shift key. */
export function needsShift(ch) {
  const k = keyFor(ch);
  return !!(k && k.shift);
}

const SPOKEN = {
  ' ': 'space bar', ';': 'semicolon', "'": 'apostrophe', ',': 'comma', '.': 'period', '/': 'slash',
  '?': 'question mark', '!': 'exclamation mark', '-': 'dash', '=': 'equals', ':': 'colon', '"': 'quote',
  '`': 'backtick', '[': 'left bracket', ']': 'right bracket', '\\': 'backslash', a: 'ay',
};

/** Friendly spoken name of a key (used for speech synthesis prompts). */
export function spokenName(ch) {
  if (SPOKEN[ch]) return SPOKEN[ch];
  if (/^[A-Z]$/.test(ch)) return `capital ${ch === 'A' ? 'ay' : ch}`;
  if (/^[a-z]$/.test(ch)) return ch.toUpperCase();
  return ch;
}

/** Label shown on a big key cap (what is printed on a physical keyboard). */
export function capLabel(ch) {
  if (ch === ' ') return 'space';
  if (/^[a-z]$/.test(ch)) return ch.toUpperCase();
  return ch;
}

/** A short "use your ___" hint for a character, including shift guidance. */
export function fingerHint(ch) {
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
