// Lesson text generation. Everything here is pure and driven by a seeded RNG so
// it can be tested deterministically.
import { WORDS, NAMES, SENTENCES, QUESTIONS, APOSTROPHES, NUMBER_SENTENCES, FACTS } from './words.js';

/** Small, fast seeded PRNG. Returns a function producing floats in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function weightedPick(rng, items, weightOf) {
  let total = 0;
  const ws = items.map((it) => { const w = Math.max(0.0001, weightOf(it)); total += w; return w; });
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Can every character of `str` be typed with the keys in `poolSet`? */
export function canType(str, poolSet) {
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
export function typeableChars(pool) {
  return pool.filter((k) => k.length === 1 && k !== ' ');
}

const wOf = (weights) => (ch) => (weights && weights[ch]) || 1;

/**
 * Sequence of single keys for the "hatch" (find-the-key) mode.
 * New keys are introduced first and appear more often; no immediate repeats.
 */
export function hatchSequence({ pool, focus = [], count, rng }) {
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
export function drillText({ pool, focus = [], length, rng, weights }) {
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
export function wordsText({ pool, focus = [], count, rng, weights, capitals = false, names = false, bank = WORDS }) {
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
export function sentencesText({ pool, bank, length, rng, fallback }) {
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
export function numbersText({ pool, focus = [], count, rng }) {
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
export function meteorItems({ pool, focus = [], kind, count, rng, weights }) {
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
export function buildContent(level, pool, { rng, weights } = {}) {
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
