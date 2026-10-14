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

export const WORLDS = [
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
export const LEVELS = [];
WORLDS.forEach((world, wi) => {
  world.levels.forEach((level, li) => {
    LEVELS.push(Object.assign(level, { worldId: world.id, worldIndex: wi, indexInWorld: li, globalIndex: LEVELS.length }));
  });
});

const BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function getLevel(id) { return BY_ID.get(id); }
export function getWorld(id) { return WORLDS.find((w) => w.id === id); }

/** Cumulative set of keys known after completing everything up to and including `levelId`. */
export function poolFor(levelId) {
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

export function nextLevel(levelId) {
  const level = BY_ID.get(levelId);
  return level ? LEVELS[level.globalIndex + 1] || null : null;
}

/**
 * Is a level playable?
 * @param {string} levelId
 * @param {Record<string, {stars:number}>} progress  per-level results
 * @param {{startWorld?: number, unlockAll?: boolean}} opts
 */
export function isUnlocked(levelId, progress, { startWorld = 0, unlockAll = false } = {}) {
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
export function currentLevel(progress, opts = {}) {
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
export function starsFor(level, stats) {
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
export const START_OPTIONS = [
  { world: 0, emoji: '🥚', title: 'Just starting', desc: 'Finding keys for the very first time (ages 4–5)' },
  { world: 1, emoji: '🌼', title: 'I know my letters', desc: 'Ready to learn the home row (ages 5–6)' },
  { world: 2, emoji: '🌴', title: 'Learning to type', desc: 'I know the home row (ages 6–8)' },
  { world: 4, emoji: '🏜️', title: 'I can type words', desc: 'Ready for capitals and sentences' },
  { world: 6, emoji: '☁️', title: 'Ready to race', desc: 'I can touch type – make me faster!' },
];
