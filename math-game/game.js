'use strict';

// =====================================================================
//  BMX Math Jam — solve arithmetic to land jumps & tricks.
//  Faster correct answers = bigger tricks.
// =====================================================================

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');

// Virtual coordinate system: everything is drawn in a 720-unit-tall world
// that is scaled to fit the screen height.
const VH = 720;
const GROUND = 560;
const RIDER_X_FRAC = 0.28;
const TOTAL_JUMPS = 10;
const BIKE_SCALE = 1.5;
let scale = 1;
let VW = 1280;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  scale = canvas.height / VH;
  VW = canvas.width / scale;
}
addEventListener('resize', resize);
resize();

// ---------- helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

// ---------- configuration ----------
// th = seconds thresholds for [mega, big, cool, nice]; slower = easy tier
const LEVELS = {
  rookie:  { name: 'Rookie',    desc: 'Adding up to 10', th: [3, 5, 8, 12] },
  rider:   { name: 'Rider',     desc: '+ and − up to 20', th: [4, 6, 9, 14] },
  pro:     { name: 'Pro',       desc: '+ and − up to 50', th: [6, 9, 13, 18] },
  legend:  { name: 'Legend',    desc: '+ − up to 100 and ×', th: [6, 9, 13, 18] },
  dynamic: { name: '⚡ Dynamic Mode', desc: 'Adapts to streak! 3 misses in a row = out', th: [3, 5, 8, 12] },
};

// Trick animation channels (all optional):
//   rot   – flips in turns (negative = backflip, positive = front flip)
//   spin  – flat 360 spins in turns (whole bike + rider)
//   whip  – tailwhips in turns (frame spins around the handlebars)
//   bar   – 'spin' (let go + catch), 'turn' (360 holding on), 'xup' (turn 180 and hold)
//   crank – backward crank spins in turns
//   lay   – lay the bike over sideways (a "whip")
//   pose  – rider body pose (see POSES)
//   H / T – optional override of the tier's jump height / airtime
const TIERS = {
  mega: {
    label: '⚡ MEGA TRICK', color: '#ff2d95', H: 235, T: 1.85, speed: 500, points: 1500,
    tricks: [
      { name: 'FLARE!!!', rot: -1, spin: 1, pose: 'tuck' },
      { name: 'BACKFLIP NO-HANDER!!!', rot: -1, pose: 'nohander' },
      { name: '360 TAILWHIP!!!', spin: 1, whip: 1, pose: 'whip' },
      { name: 'DOUBLE BACKFLIP!!!', rot: -2, pose: 'tuck', H: 265, T: 2.2 },
      { name: 'FRONT FLIP!!!', rot: 1, pose: 'tuck' },
    ],
  },
  big: {
    label: '🚀 BIG TRICK', color: '#ff6d00', H: 205, T: 1.55, speed: 460, points: 1000,
    tricks: [
      { name: '360!!', spin: 1, pose: 'tuck' },
      { name: 'TAILWHIP!!', whip: 1, pose: 'whip' },
      { name: 'BACKFLIP BAR SPIN!!', rot: -1, bar: 'spin', pose: 'release' },
    ],
  },
  cool: {
    label: '😎 COOL TRICK', color: '#f5b800', H: 165, T: 1.3, speed: 420, points: 500,
    tricks: [
      { name: 'INDY!', pose: 'indy' },
      { name: 'CAN CAN!', pose: 'cancan' },
    ],
  },
  nice: {
    label: '🙌 NICE TRICK', color: '#2eb84b', H: 120, T: 1.05, speed: 380, points: 250,
    tricks: [
      { name: 'WHIP!', lay: 1, pose: 'ride' },
      { name: 'X-UP!', bar: 'xup', pose: 'xup' },
    ],
  },
  easy: {
    label: '🐰 EASY TRICK', color: '#1e9be0', H: 70, T: 0.85, speed: 330, points: 100,
    tricks: [
      { name: 'Bar Turn!', bar: 'turn', pose: 'ride' },
      { name: 'Crank Flip!', crank: 2, pose: 'feetoff' },
    ],
  },
  wobble: {
    label: '❌ Wobbly hop', color: '#9e9e9e', H: 35, T: 0.6, speed: 270, points: 0,
    tricks: [{ name: 'Whoa! Wobbly!', pose: 'wobble' }],
  },
};
const TIER_ORDER = ['mega', 'big', 'cool', 'nice', 'easy'];
const TIER_LABEL = Object.fromEntries(Object.entries(TIERS).map(([k, t]) => [k, t.label]));
const TIER_COLOR = Object.fromEntries(Object.entries(TIERS).map(([k, t]) => [k, t.color]));

// Build a concrete trick: tier physics + a random variant (avoid repeating the last one).
let lastTrickName = '';
function makeTrick(tierKey) {
  const tier = TIERS[tierKey];
  let pool = tier.tricks.filter((t) => t.name !== lastTrickName);
  if (!pool.length) pool = tier.tricks;
  const v = pool[randInt(0, pool.length - 1)];
  lastTrickName = v.name;
  return {
    tier: tierKey, color: tier.color, points: tier.points, speed: tier.speed,
    H: tier.H, T: tier.T,
    rot: 0, spin: 0, whip: 0, bar: null, crank: 0, lay: 0, pose: 'ride',
    ...v,
  };
}
const COLORS = ['#ff3b3b', '#ff9800', '#ffd600', '#00c853', '#2979ff', '#aa00ff', '#ff4081', '#37474f'];

// ---------- math problems ----------
let lastQ = '';
function makeProblem(level) {
  let a, b, op, ans, q;
  for (let tries = 0; tries < 20; tries++) {
    if (level === 'rookie') {
      op = '+'; a = randInt(1, 9); b = randInt(1, 10 - a);
    } else if (level === 'rider') {
      if (Math.random() < 0.5) { op = '+'; a = randInt(1, 15); b = randInt(1, 20 - a); }
      else { op = '−'; a = randInt(3, 20); b = randInt(1, a - 1); }
    } else if (level === 'pro') {
      if (Math.random() < 0.5) { op = '+'; a = randInt(5, 40); b = randInt(2, 50 - a); }
      else { op = '−'; a = randInt(10, 50); b = randInt(2, a - 1); }
    } else {
      const r = Math.random();
      if (r < 0.33) { op = '+'; a = randInt(10, 80); b = randInt(5, 100 - a); }
      else if (r < 0.66) { op = '−'; a = randInt(20, 100); b = randInt(5, a - 1); }
      else {
        op = '×'; a = [2, 3, 4, 5, 10][randInt(0, 4)]; b = randInt(1, 10);
        if (Math.random() < 0.5) [a, b] = [b, a];
      }
    }
    ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
    q = `${a} ${op} ${b}`;
    if (q !== lastQ) break;
  }
  lastQ = q;
  return { text: q, answer: ans };
}

// Adaptive problem generator for Dynamic Mode:
// Stage 1: simple additions up to 7
// Stage 2: additions up to 10
// Stage 3: additions up to 14, subtractions up to 10
// Stage 4: additions up to 20, subtractions up to 18
// Stage 5: additions up to 35, subtractions up to 30, x2 and x10
// Stage 6: additions up to 60, subtractions up to 50, x2, x3, x4, x5, x10
// Stage 7: additions/subtractions up to 100, tables 2-9
// Stage 8+: full mixed tables and 2-digit sums
function makeDynamicProblem(stage) {
  let a, b, op, ans, q;
  for (let tries = 0; tries < 30; tries++) {
    if (stage === 1) {
      op = '+';
      a = randInt(1, 5);
      b = randInt(1, 7 - a);
    } else if (stage === 2) {
      op = '+';
      a = randInt(2, 7);
      b = randInt(1, 10 - a);
    } else if (stage === 3) {
      if (Math.random() < 0.55) {
        op = '+';
        a = randInt(3, 9);
        b = randInt(2, 14 - a);
      } else {
        op = '−';
        a = randInt(3, 10);
        b = randInt(1, a - 1);
      }
    } else if (stage === 4) {
      if (Math.random() < 0.5) {
        op = '+';
        a = randInt(5, 12);
        b = randInt(3, 20 - a);
      } else {
        op = '−';
        a = randInt(6, 18);
        b = randInt(2, a - 2);
      }
    } else if (stage === 5) {
      const r = Math.random();
      if (r < 0.4) {
        op = '+';
        a = randInt(8, 25);
        b = randInt(4, 35 - a);
      } else if (r < 0.7) {
        op = '−';
        a = randInt(12, 30);
        b = randInt(3, a - 3);
      } else {
        op = '×';
        a = [2, 10][randInt(0, 1)];
        b = randInt(2, 9);
        if (Math.random() < 0.5) [a, b] = [b, a];
      }
    } else if (stage === 6) {
      const r = Math.random();
      if (r < 0.35) {
        op = '+';
        a = randInt(12, 45);
        b = randInt(6, 60 - a);
      } else if (r < 0.65) {
        op = '−';
        a = randInt(15, 50);
        b = randInt(5, a - 4);
      } else {
        op = '×';
        a = [2, 3, 4, 5, 10][randInt(0, 4)];
        b = randInt(2, 9);
        if (Math.random() < 0.5) [a, b] = [b, a];
      }
    } else if (stage === 7) {
      const r = Math.random();
      if (r < 0.3) {
        op = '+';
        a = randInt(20, 75);
        b = randInt(8, 100 - a);
      } else if (r < 0.6) {
        op = '−';
        a = randInt(25, 80);
        b = randInt(8, a - 5);
      } else {
        op = '×';
        a = randInt(2, 9);
        b = randInt(2, 9);
      }
    } else {
      const r = Math.random();
      if (r < 0.3) {
        op = '+';
        a = randInt(25, 85);
        b = randInt(10, 100 - a);
      } else if (r < 0.6) {
        op = '−';
        a = randInt(35, 100);
        b = randInt(10, a - 5);
      } else {
        op = '×';
        a = randInt(4, 9);
        b = randInt(4, 9);
      }
    }
    ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
    q = `${a} ${op} ${b}`;
    if (q !== lastQ) break;
  }
  lastQ = q;
  return { text: q, answer: ans, stage };
}

// ---------- sound (synthesized, no files needed) ----------
let actx = null;
let muted = localStorage.getItem('bmx_muted') === '1';
function audio() {
  if (!actx) {
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
  }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(f, dur, { type = 'sine', vol = 0.15, delay = 0, slide = null } = {}) {
  if (muted || mode !== 'play') return;
  const a = audio(); if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function noise(dur, { vol = 0.2, delay = 0, f0 = 800, f1 = 3000, type = 'bandpass' } = {}) {
  if (muted || mode !== 'play') return;
  const a = audio(); if (!a) return;
  const t0 = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf;
  const filt = a.createBiquadFilter(); filt.type = type;
  filt.frequency.setValueAtTime(f0, t0);
  filt.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(g).connect(a.destination);
  src.start(t0);
}
const sfx = {
  key: () => tone(900, 0.05, { type: 'square', vol: 0.04 }),
  correct: () => { tone(660, 0.12, { type: 'triangle', vol: 0.2 }); tone(990, 0.2, { type: 'triangle', vol: 0.2, delay: 0.1 }); },
  wrong: () => tone(320, 0.3, { type: 'sawtooth', vol: 0.06, slide: 180 }),
  whoosh: () => noise(0.5, { vol: 0.25, f0: 400, f1: 2500 }),
  land: () => { tone(110, 0.18, { vol: 0.3, slide: 50 }); noise(0.15, { vol: 0.15, f0: 400, f1: 200, type: 'lowpass' }); },
  cheer: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.15, delay: i * 0.08 }));
    noise(1.2, { vol: 0.08, f0: 1500, f1: 1200 });
  },
  fanfare: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.15, delay: i * 0.13 })),
};

// ---------- game state ----------
let mode = 'menu';   // 'menu' | 'play' | 'results'
let phase = 'cruise'; // 'cruise' | 'question' | 'go' | 'air' | 'finish'
let time = 0;
let cam = 0;
let finishT = 0;
let ramps = [];
let particles = [];
let texts = [];

const rider = {
  x: 0, y: 0, angle: 0, speed: 300, wheel: 0, crank: 0,
  trick: null, airT: 0, launchH: 0, launchAng: 0,
  squash: 0, wobbleT: 0, blend: 0, pose: 'ride',
  // per-trick animation channels (radians)
  whip: 0, spin: 0, bar: 0, crankExtra: 0, lay: 0,
};

const settings = {
  level: LEVELS[localStorage.getItem('bmx_level')] ? localStorage.getItem('bmx_level') : 'rookie',
  color: localStorage.getItem('bmx_color') || COLORS[0],
};

let game = null;
let problem = null;
let qStart = 0;
let typed = '';

const BACKGROUNDS = ['farm', 'skate', 'urban', 'mountain', 'beach'];
const BG_INFO = {
  farm:     { name: 'Farm Jumps',        banner: '🚜 FARM JUMPS! 🌾',        color: '#8fd18f' },
  skate:    { name: 'Skate Park',         banner: '🛹 SKATE PARK! ⚡',         color: '#ff7043' },
  urban:    { name: 'Urban Jungle',       banner: '🌆 URBAN JUNGLE! 🏙️',      color: '#00e5ff' },
  mountain: { name: 'Mountain Descent',   banner: '🏔️ MOUNTAIN DESCENT! 🌲', color: '#80d8ff' },
  beach:    { name: 'Ocean Beach',        banner: '🌴 OCEAN BEACH! 🌊',        color: '#ffd54f' },
};
let currentBg = BACKGROUNDS[randInt(0, BACKGROUNDS.length - 1)];
let bgTransition = { active: false, from: currentBg, to: currentBg, t: 0, dur: 2.2 };

function cycleBackground() {
  const choices = BACKGROUNDS.filter((b) => b !== currentBg);
  const nextBg = choices[randInt(0, choices.length - 1)];
  bgTransition = {
    active: true,
    from: currentBg,
    to: nextBg,
    t: 0,
    dur: 2.2,
  };
  currentBg = nextBg;
  const info = BG_INFO[nextBg];
  addText(info.banner, VW * 0.5, 190, 50, info.color);
  sfx.cheer();
}

const clouds = Array.from({ length: 7 }, (_, i) => ({ x: i * 260 + rand(0, 150), y: rand(40, 220), s: rand(0.6, 1.3), p: rand(0.05, 0.15) }));

function newGame() {
  game = {
    score: 0, jump: 0, streak: 0, bestStreak: 0, correct: 0,
    fastest: null, bestTrickIdx: 99, bestTrickName: '',
    diffStage: 1, maxStage: 1, missStreak: 0,
  };
}

function resetWorld() {
  Object.assign(rider, {
    x: 0, y: 0, angle: 0, speed: 300, trick: null, squash: 0, wobbleT: 0, blend: 0, pose: 'ride',
    whip: 0, spin: 0, bar: 0, crankExtra: 0, lay: 0,
  });
  ramps = []; particles = []; texts = [];
  phase = 'cruise';
  addRamp(900);
}

function addRamp(x) {
  ramps.push({ x, len: 150, h: randInt(70, 85), back: 55, flag: COLORS[randInt(0, COLORS.length - 1)], done: false });
}
const currentRamp = () => ramps.find((r) => !r.done);

function groundHeightAt(x) {
  for (const r of ramps) {
    const u = (x - r.x) / r.len;
    if (u >= 0 && u <= 1) return r.h * u * u;
    const v = (x - r.x - r.len) / r.back;
    if (v > 0 && v <= 1) return r.h * (1 - v);
  }
  return 0;
}

// ---------- question flow ----------
function startQuestion() {
  phase = 'question';
  problem = settings.level === 'dynamic' ? makeDynamicProblem(game ? (game.diffStage || 1) : 1) : makeProblem(settings.level);
  typed = '';
  qStart = performance.now();
  showQuiz();
}

function getThresholds() {
  if (settings.level === 'dynamic') {
    const s = game ? (game.diffStage || 1) : 1;
    return [
      3 + (s - 1) * 0.5,
      5 + (s - 1) * 0.7,
      8 + (s - 1) * 1.0,
      12 + (s - 1) * 1.2,
    ];
  }
  return LEVELS[settings.level].th;
}

function tierForTime(elapsed) {
  const th = getThresholds();
  const i = th.findIndex((x) => elapsed < x);
  return TIER_ORDER[i < 0 ? 4 : i];
}

function submit() {
  if (phase !== 'question' || typed === '') return;
  const elapsed = (performance.now() - qStart) / 1000;
  const ok = parseInt(typed, 10) === problem.answer;
  let key;
  if (ok) {
    key = tierForTime(elapsed);
    game.correct++;
    game.streak++;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    if (game.fastest === null || elapsed < game.fastest) game.fastest = elapsed;
    if (settings.level === 'dynamic') {
      game.missStreak = 0;
      game.diffStage = Math.min(8, game.diffStage + 1);
      game.maxStage = Math.max(game.maxStage, game.diffStage);
    }
    sfx.correct();
    showFeedback(true, elapsed);
  } else {
    key = 'wobble';
    game.streak = 0;
    if (settings.level === 'dynamic') {
      game.missStreak++;
      game.diffStage = Math.max(1, game.diffStage - 1);
    }
    sfx.wrong();
    showFeedback(false);
  }
  rider.trick = makeTrick(key);
  const idx = TIER_ORDER.indexOf(key);
  if (idx >= 0 && idx < game.bestTrickIdx) { game.bestTrickIdx = idx; game.bestTrickName = rider.trick.name.replace(/!+$/, ''); }
  phase = 'go';
  updateHUD();
}

// Demo mode (menu background): pick a random trick automatically.
function autoTrick() {
  rider.trick = makeTrick(TIER_ORDER[randInt(0, TIER_ORDER.length - 1)]);
  phase = 'go';
}

function launch(r) {
  phase = 'air';
  rider.airT = 0;
  rider.launchH = r.h;
  rider.launchAng = rider.angle;
  r.done = true;
  sfx.whoosh();
  const tr = rider.trick;
  addText(tr.name, VW * 0.64, 250, tr.points >= 1000 ? 58 : 50, tr.color);
}

function land() {
  const tr = rider.trick;
  rider.y = 0; rider.angle = 0; rider.squash = 1; rider.blend = 0;
  Object.assign(rider, { whip: 0, spin: 0, bar: 0, crankExtra: 0, lay: 0 });
  sfx.land();
  dust(rider.x, 12 + Math.floor(tr.H / 12));
  if (tr.tier === 'wobble') rider.wobbleT = 1.3;
  if (tr.points >= 500) { confetti(rider.x, GROUND - 120, tr.points >= 1000 ? 70 : 35); sfx.cheer(); }

  if (mode === 'play') {
    if (tr.points) {
      const mult = Math.min(3, 1 + (game.streak - 1) * 0.5);
      const pts = Math.round(tr.points * mult);
      game.score += pts;
      addText(`+${pts}` + (mult > 1 ? `  (x${mult} combo!)` : ''), VW * 0.64, 330, 40, '#ffffff');
    } else {
      if (settings.level === 'dynamic' && game.missStreak >= 3) {
        addText('CRASH! 💥', VW * 0.64, 330, 46, '#ff3b3b');
        rider.wobbleT = 3;
      } else {
        addText('Keep going! 💪', VW * 0.64, 330, 40, '#ffffff');
      }
    }
    game.jump++;
    updateHUD();
    hideQuiz();
    if (settings.level === 'dynamic') {
      if (game.missStreak >= 3) {
        phase = 'finish';
        finishT = 2.2;
        return;
      }
      if (game.jump > 0 && game.jump % 10 === 0) {
        cycleBackground();
      }
    } else {
      if (game.jump >= TOTAL_JUMPS) {
        phase = 'finish';
        finishT = 2.2;
        return;
      }
    }
  }
  phase = 'cruise';
  addRamp(rider.x + randInt(700, 1000));
}

// ---------- update ----------
function update(dt) {
  time += dt;
  if (bgTransition.active) {
    bgTransition.t += dt;
    if (bgTransition.t >= bgTransition.dur) {
      bgTransition.active = false;
    }
  }
  const ramp = currentRamp();
  const dist = ramp ? ramp.x - rider.x : 1e9;
  let target = 300;
  let k = 2.5;

  if (phase === 'cruise') {
    if (ramp && dist < 650) {
      if (mode === 'play') startQuestion(); else autoTrick();
    }
  } else if (phase === 'question') {
    // Roll up to the ramp and wait there until the answer comes in.
    target = clamp((dist - 170) / 380, 0, 1) * 170;
    updateTimerUI();
  } else if (phase === 'go') {
    target = rider.trick.speed; k = 3;
  } else if (phase === 'air') {
    target = rider.speed;
  } else if (phase === 'finish') {
    finishT -= dt;
    if (finishT <= 0) { showResults(); phase = 'cruise'; addRamp(rider.x + 900); }
  }

  rider.speed += (target - rider.speed) * Math.min(1, dt * k);
  rider.x += rider.speed * dt;
  rider.wheel += (rider.speed * dt) / 18;

  if (phase === 'air') {
    const tr = rider.trick;
    rider.airT += dt;
    const s = Math.min(1, rider.airT / tr.T);
    const TAU = Math.PI * 2;
    // 0→1 over a window of the airtime
    const prog = (a, b) => ease(clamp((s - a) / (b - a), 0, 1));
    // 0→1→0: ease in, hold, ease out
    const hold = prog(0.1, 0.35) * (1 - prog(0.65, 0.9));
    rider.y = rider.launchH * (1 - s) + 4 * tr.H * s * (1 - s);
    rider.angle = rider.launchAng * (1 - Math.min(1, s * 3)) + tr.rot * TAU * prog(0.08, 0.88);
    rider.spin = tr.spin * TAU * prog(0.1, 0.85);
    rider.whip = tr.whip * TAU * prog(0.15, 0.75);
    rider.bar = tr.bar === 'xup' ? Math.PI * hold : tr.bar === 'turn' ? Math.PI * 0.55 * hold : tr.bar ? TAU * prog(0.18, 0.72) : 0;
    rider.crankExtra = -tr.crank * TAU * prog(0.1, 0.8);
    rider.lay = tr.lay * 1.15 * hold;
    rider.pose = tr.pose;
    rider.blend = Math.sin(Math.PI * clamp((s - 0.04) / 0.86, 0, 1));
    if (s >= 1) land();
  } else {
    rider.crank += (rider.speed * dt) / 30;
    rider.y = groundHeightAt(rider.x);
    const u = ramp ? (rider.x - ramp.x) / ramp.len : -1;
    rider.angle = u >= 0 && u <= 1 ? -Math.atan((2 * ramp.h * u) / ramp.len) : 0;
    if (phase === 'go' && ramp && rider.x >= ramp.x + ramp.len) launch(ramp);
    if (rider.wobbleT > 0) { rider.pose = 'wobble'; rider.blend = Math.min(1, rider.wobbleT); }
    else rider.blend = Math.max(0, rider.blend - dt * 4);
  }

  rider.squash = Math.max(0, rider.squash - dt * 4);
  rider.wobbleT = Math.max(0, rider.wobbleT - dt);

  // rolling dust
  if (phase !== 'air' && rider.speed > 250 && Math.random() < 0.3) {
    let dc = '190,140,90';
    if (currentBg === 'skate') dc = '160,175,185';
    else if (currentBg === 'urban') dc = '125,140,155';
    else if (currentBg === 'mountain') dc = '150,120,95';
    else if (currentBg === 'beach') dc = '235,200,120';
    particles.push({ x: rider.x - 40, y: GROUND - rider.y - 2, vx: rand(-60, -20), vy: rand(-40, -10), g: 60, life: 0.5, max: 0.5, size: rand(3, 6), type: 'dust', color: dc });
  }

  cam = rider.x - VW * RIDER_X_FRAC;
  ramps = ramps.filter((r) => r.x + r.len + r.back > cam - 200);

  for (const p of particles) {
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.rot !== undefined) p.rot += p.vr * dt;
  }
  particles = particles.filter((p) => p.life > 0);

  for (const t of texts) { t.age += dt; t.y -= 25 * dt; }
  texts = texts.filter((t) => t.age < t.max);
}

// ---------- effects ----------
function dust(wx, n) {
  let dc = '190,140,90';
  if (currentBg === 'skate') dc = '160,175,185';
  else if (currentBg === 'urban') dc = '125,140,155';
  else if (currentBg === 'mountain') dc = '150,120,95';
  else if (currentBg === 'beach') dc = '235,200,120';
  for (let i = 0; i < n; i++) {
    particles.push({ x: wx + rand(-30, 30), y: GROUND - rand(0, 6), vx: rand(-140, 80), vy: rand(-170, -40), g: 320, life: rand(0.5, 0.9), max: 0.9, size: rand(4, 10), type: 'dust', color: dc });
  }
}
function confetti(wx, y, n) {
  const cols = ['#ff3b3b', '#ffd600', '#00c853', '#2979ff', '#ff4081', '#aa00ff', '#ff9800'];
  for (let i = 0; i < n; i++) {
    particles.push({ x: wx + rand(-40, 120), y: y + rand(-40, 20), vx: rand(-80, 260), vy: rand(-420, -150), g: 380, life: rand(1.2, 2), max: 2, size: rand(6, 11), type: 'conf', color: cols[i % cols.length], rot: rand(0, 6), vr: rand(-10, 10) });
  }
}
function addText(text, x, y, size, color) {
  texts.push({ text, x, y, size, color, age: 0, max: 1.6 });
}

// ---------- drawing: world ----------
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

function drawCloud(x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  circle(x, y, 28 * s); circle(x + 30 * s, y - 12 * s, 32 * s); circle(x + 62 * s, y, 26 * s); circle(x + 30 * s, y + 8 * s, 26 * s);
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#3fa9f5'); g.addColorStop(1, '#c4ecff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
  ctx.fillStyle = 'rgba(255,236,120,.35)'; circle(VW - 140, 120, 72);
  ctx.fillStyle = '#ffe066'; circle(VW - 140, 120, 46);
  for (const c of clouds) {
    const span = VW + 400;
    const x = (((c.x - cam * c.p) % span) + span) % span - 200;
    drawCloud(x, c.y, c.s);
  }
}

function hillY(wx, base, amp, f, ph) {
  return base - (Math.sin(wx * f + ph) * amp + Math.sin(wx * f * 2.3 + ph * 1.7) * amp * 0.45 + amp);
}

function drawTree(x, y, s) {
  ctx.fillStyle = '#6d4c2f'; ctx.fillRect(x - 4 * s, y - 30 * s, 8 * s, 30 * s);
  ctx.fillStyle = '#2e8b3e'; circle(x, y - 42 * s, 22 * s); circle(x - 12 * s, y - 30 * s, 15 * s); circle(x + 12 * s, y - 30 * s, 15 * s);
}

function drawHills(p, base, amp, f, ph, color, trees) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= VW + 20; x += 20) ctx.lineTo(x, hillY(x + cam * p, base, amp, f, ph));
  ctx.lineTo(VW + 20, GROUND); ctx.closePath(); ctx.fill();
  if (!trees) return;
  const sp = 170;
  const start = Math.floor((cam * p) / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    if (hash(k) < 0.4) continue;
    const wx = k * sp + hash(k * 7) * 80;
    drawTree(wx - cam * p, hillY(wx, base, amp, f, ph) + 6, 0.7 + hash(k * 3) * 0.5);
  }
}

// =====================================================================
//  Background & Environment Renderers
// =====================================================================

// 1. Farm jumps (countryside dirt track)
function drawFarmSky() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#3fa9f5'); g.addColorStop(1, '#c4ecff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
  ctx.fillStyle = 'rgba(255,236,120,.35)'; circle(VW - 140, 120, 72);
  ctx.fillStyle = '#ffe066'; circle(VW - 140, 120, 46);
  for (const c of clouds) {
    const span = VW + 400;
    const x = (((c.x - cam * c.p) % span) + span) % span - 200;
    drawCloud(x, c.y, c.s);
  }
}
function drawFarmBack() {
  drawHills(0.15, GROUND - 120, 45, 0.0025, 0.5, '#8fd18f', false);
}
function drawFarmMid() {
  drawHills(0.4, GROUND - 50, 35, 0.004, 2.1, '#6cc06c', true);
}
function drawFarmGround() {
  ctx.fillStyle = '#5cb85c'; ctx.fillRect(0, GROUND - 50, VW, 50);
  const sp = 140;
  const start = Math.floor(cam / sp) - 1;
  ctx.fillStyle = '#fff3e0';
  for (let k = start; k < start + VW / sp + 3; k++) ctx.fillRect(k * sp - cam, GROUND - 46, 8, 36);
  ctx.fillRect(0, GROUND - 40, VW, 6); ctx.fillRect(0, GROUND - 26, VW, 6);

  const g = ctx.createLinearGradient(0, GROUND, 0, VH);
  g.addColorStop(0, '#c08447'); g.addColorStop(1, '#7a4b22');
  ctx.fillStyle = g; ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = '#d9a066'; ctx.fillRect(0, GROUND, VW, 4);

  const ps = 45;
  const pstart = Math.floor(cam / ps) - 1;
  ctx.fillStyle = '#8d5a2b';
  for (let k = pstart; k < pstart + VW / ps + 3; k++) {
    const x = k * ps + hash(k) * ps - cam;
    const y = GROUND + 14 + hash(k * 5) * (VH - GROUND - 24);
    circle(x, y, 2 + hash(k * 9) * 3);
  }
}

// 2. Skate park (sunset twilight purple/orange, floodlights & smooth concrete)
function drawSkateSky() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#28154e');
  g.addColorStop(0.35, '#5c257f');
  g.addColorStop(0.7, '#d84315');
  g.addColorStop(1, '#ffb74d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
  ctx.fillStyle = 'rgba(255, 171, 64, 0.28)'; circle(VW * 0.72, GROUND - 140, 85);
  ctx.fillStyle = '#ffe082'; circle(VW * 0.72, GROUND - 140, 48);
  for (const c of clouds) {
    const span = VW + 400;
    const x = (((c.x - cam * c.p) % span) + span) % span - 200;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 182, 193, 0.45)';
    drawCloud(x, c.y + 20, c.s * 0.9);
    ctx.restore();
  }
}
function drawSkateBack() {
  const p = 0.12;
  const sp = 280;
  const start = Math.floor((cam * p) / sp) - 1;
  ctx.fillStyle = '#371e54';
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x = k * sp - cam * p;
    const h = 100 + hash(k) * 70;
    ctx.beginPath();
    ctx.moveTo(x, GROUND);
    ctx.lineTo(x, GROUND - h);
    ctx.lineTo(x + 100, GROUND - h - 30);
    ctx.lineTo(x + 100, GROUND - h);
    ctx.lineTo(x + 220, GROUND - h - 35);
    ctx.lineTo(x + 220, GROUND);
    ctx.closePath();
    ctx.fill();
    if (hash(k * 3) > 0.4) {
      const lx = x + 240;
      ctx.strokeStyle = '#4a2870'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx, GROUND); ctx.lineTo(lx, GROUND - 220); ctx.stroke();
      ctx.fillStyle = '#ffe57f';
      circle(lx - 8, GROUND - 222, 4); circle(lx, GROUND - 224, 4); circle(lx + 8, GROUND - 222, 4);
    }
  }
}
function drawSkateMid() {
  const p = 0.38;
  const sp = 200;
  const start = Math.floor((cam * p) / sp) - 1;
  ctx.fillStyle = '#512b7a';
  ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= VW + 20; x += 20) {
    const wx = x + cam * p;
    const y = GROUND - 40 - Math.sin(wx * 0.005) * 25 - Math.sin(wx * 0.012) * 15;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VW + 20, GROUND); ctx.closePath(); ctx.fill();

  for (let k = start; k < start + VW / sp + 3; k++) {
    const wx = k * sp + hash(k * 2) * 60;
    const x = wx - cam * p;
    const y = GROUND - 50;
    const col = ['#00e5ff', '#ff4081', '#76ff03', '#ffd600'][Math.abs(k) % 4];
    ctx.fillStyle = col;
    ctx.fillRect(x, y, 32, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y + 3, 24, 4);
  }
}
function drawSkateGround() {
  ctx.fillStyle = '#78909c'; ctx.fillRect(0, GROUND - 50, VW, 50);
  const sp = 90;
  const start = Math.floor(cam / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x = k * sp - cam;
    ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, GROUND - 48); ctx.lineTo(x, GROUND - 6); ctx.stroke();
    ctx.strokeStyle = 'rgba(176,190,197,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 44); ctx.lineTo(x + sp, GROUND - 10);
    ctx.moveTo(x, GROUND - 10); ctx.lineTo(x + sp, GROUND - 44);
    ctx.stroke();
  }
  ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, GROUND - 46); ctx.lineTo(VW, GROUND - 46); ctx.stroke();

  // Red coping curb
  ctx.fillStyle = '#e53935'; ctx.fillRect(0, GROUND - 10, VW, 10);
  ctx.fillStyle = '#ff8a80'; ctx.fillRect(0, GROUND - 10, VW, 3);

  // Concrete track
  const g = ctx.createLinearGradient(0, GROUND, 0, VH);
  g.addColorStop(0, '#90a4ae'); g.addColorStop(1, '#546e7a');
  ctx.fillStyle = g; ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, GROUND + 18, VW, 4);

  const js = 160;
  const jstart = Math.floor(cam / js) - 1;
  ctx.fillStyle = '#455a64';
  for (let k = jstart; k < jstart + VW / js + 3; k++) {
    ctx.fillRect(k * js - cam, GROUND, 3, VH - GROUND);
  }
}

// 3. Urban jungle (city twilight, skyscrapers, streetlights & asphalt)
function drawUrbanSky() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#0d1527');
  g.addColorStop(0.4, '#1b1a40');
  g.addColorStop(0.75, '#5c1349');
  g.addColorStop(1, '#c2410c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
  // Crescent moon
  ctx.fillStyle = '#fff9c4'; circle(VW - 160, 95, 26);
  ctx.fillStyle = '#0d1527'; circle(VW - 150, 91, 23);
  // Stars
  for (let i = 0; i < 28; i++) {
    const sx = (hash(i * 13) * VW * 2 - (cam * 0.02) % VW + VW) % VW;
    const sy = 25 + hash(i * 29) * 160;
    const sa = 0.4 + 0.5 * Math.sin(time * 3 + i);
    ctx.fillStyle = `rgba(255,255,255,${sa})`;
    ctx.fillRect(sx, sy, 2, 2);
  }
}
function drawUrbanBack() {
  const p = 0.1;
  const sp = 110;
  const start = Math.floor((cam * p) / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x = k * sp - cam * p;
    const w = 90 + hash(k * 7) * 40;
    const h = 180 + hash(k * 11) * 150;
    ctx.fillStyle = hash(k) > 0.5 ? '#111827' : '#1f293d';
    ctx.fillRect(x, GROUND - h, w, h);
    if (hash(k * 5) > 0.4) {
      const ax = x + w * 0.5;
      ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax, GROUND - h); ctx.lineTo(ax, GROUND - h - 35); ctx.stroke();
      const blink = Math.sin(time * 4 + k) > 0;
      ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
      circle(ax, GROUND - h - 36, 3);
    }
    for (let r = 0; r < Math.floor((h - 30) / 20); r++) {
      for (let c = 0; c < Math.floor((w - 16) / 16); c++) {
        if (hash(k * 99 + r * 17 + c) > 0.42) {
          ctx.fillStyle = hash(r + c) > 0.3 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(103, 232, 249, 0.65)';
          ctx.fillRect(x + 8 + c * 16, GROUND - h + 15 + r * 20, 8, 10);
        }
      }
    }
  }
}
function drawUrbanMid() {
  const p = 0.35;
  const sp = 220;
  const start = Math.floor((cam * p) / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x = k * sp - cam * p;
    const h = 80 + hash(k * 3) * 60;
    ctx.fillStyle = '#372727'; ctx.fillRect(x, GROUND - h, 190, h);
    ctx.fillStyle = '#4a3737'; ctx.fillRect(x - 5, GROUND - h - 6, 200, 8);
    if (hash(k * 7) > 0.45) {
      const tx = x + 40, ty = GROUND - h - 45;
      ctx.strokeStyle = '#261c1c'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tx, GROUND - h); ctx.lineTo(tx + 6, ty + 24);
      ctx.moveTo(tx + 30, GROUND - h); ctx.lineTo(tx + 24, ty + 24);
      ctx.stroke();
      ctx.fillStyle = '#5c4033'; ctx.fillRect(tx + 4, ty, 22, 24);
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.moveTo(tx + 1, ty); ctx.lineTo(tx + 15, ty - 12); ctx.lineTo(tx + 29, ty); ctx.closePath(); ctx.fill();
    }
  }
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= VW + 50; x += 30) {
    const wx = x + cam * p;
    const y = GROUND - 110 + Math.sin(wx * 0.008) * 12;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function drawUrbanGround() {
  ctx.fillStyle = '#475569'; ctx.fillRect(0, GROUND - 48, VW, 48);
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, GROUND - 48, VW, 4);
  const sp = 200;
  const start = Math.floor(cam / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x = k * sp - cam;
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, GROUND - 48); ctx.lineTo(x, GROUND - 110);
    ctx.lineTo(x + 16, GROUND - 115); ctx.stroke();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.25)'; circle(x + 16, GROUND - 115, 20);
    ctx.fillStyle = '#fef08a'; circle(x + 16, GROUND - 115, 6);
  }
  const g = ctx.createLinearGradient(0, GROUND, 0, VH);
  g.addColorStop(0, '#1e293b'); g.addColorStop(1, '#0f172a');
  ctx.fillStyle = g; ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = '#334155'; ctx.fillRect(0, GROUND, VW, 3);

  const ds = 80;
  const dstart = Math.floor(cam / ds) - 1;
  ctx.fillStyle = '#eab308';
  for (let k = dstart; k < dstart + VW / ds + 3; k++) {
    const x = k * ds - cam;
    ctx.fillRect(x, GROUND + 35, 42, 6);
  }
}

// 4. Mountain descent (snow peaks, pine forests & rocky trail)
function drawMountainSky() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#0c4a6e');
  g.addColorStop(0.45, '#0284c7');
  g.addColorStop(1, '#bae6fd');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
  const sx = VW - 130, sy = 110;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; circle(sx, sy, 78);
  ctx.fillStyle = '#ffffff'; circle(sx, sy, 42);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx - 85, sy); ctx.lineTo(sx + 85, sy);
  ctx.moveTo(sx, sy - 85); ctx.lineTo(sx, sy + 85);
  ctx.stroke();
  for (const c of clouds) {
    const span = VW + 400;
    const x = (((c.x - cam * c.p) % span) + span) % span - 200;
    drawCloud(x, c.y * 0.75, c.s * 0.85);
  }
}
function drawMountainBack() {
  const p = 0.09;
  const sp = 260;
  const start = Math.floor((cam * p) / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x = k * sp - cam * p;
    const peakX = x + 130;
    const peakY = GROUND - 240 - hash(k) * 90;
    ctx.beginPath();
    ctx.moveTo(x - 50, GROUND);
    ctx.lineTo(peakX, peakY);
    ctx.lineTo(x + 310, GROUND);
    ctx.closePath();
    ctx.fillStyle = '#334155'; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(x + 310, GROUND);
    ctx.lineTo(peakX, GROUND);
    ctx.closePath();
    ctx.fillStyle = '#1e293b'; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(peakX - 35, peakY + 65);
    ctx.lineTo(peakX, peakY);
    ctx.lineTo(peakX + 45, peakY + 75);
    ctx.lineTo(peakX + 20, peakY + 55);
    ctx.lineTo(peakX, peakY + 65);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc'; ctx.fill();
  }
}
function drawMountainMid() {
  const p = 0.32;
  ctx.fillStyle = '#14532d';
  ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= VW + 20; x += 20) {
    const wx = x + cam * p;
    ctx.lineTo(x, GROUND - 60 - Math.sin(wx * 0.003) * 35 - Math.sin(wx * 0.009) * 20);
  }
  ctx.lineTo(VW + 20, GROUND); ctx.closePath(); ctx.fill();

  const sp = 55;
  const start = Math.floor((cam * p) / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const wx = k * sp + hash(k) * 25;
    const x = wx - cam * p;
    const y = GROUND - 60 - Math.sin(wx * 0.003) * 35 - Math.sin(wx * 0.009) * 20;
    const h = 32 + hash(k * 7) * 20;
    ctx.fillStyle = '#3e2723'; ctx.fillRect(x - 2, y, 4, 12);
    ctx.fillStyle = hash(k * 3) > 0.5 ? '#166534' : '#15803d';
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + 14, y); ctx.lineTo(x - 14, y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - h - 10); ctx.lineTo(x + 11, y - 8); ctx.lineTo(x - 11, y - 8); ctx.closePath(); ctx.fill();
  }
}
function drawMountainGround() {
  ctx.fillStyle = '#4d7c0f'; ctx.fillRect(0, GROUND - 50, VW, 50);
  const sp = 120;
  const start = Math.floor(cam / sp) - 1;
  ctx.fillStyle = '#5c4033';
  for (let k = start; k < start + VW / sp + 3; k++) {
    ctx.fillRect(k * sp - cam, GROUND - 44, 10, 36);
  }
  ctx.fillRect(0, GROUND - 38, VW, 6);
  ctx.fillRect(0, GROUND - 22, VW, 6);

  const g = ctx.createLinearGradient(0, GROUND, 0, VH);
  g.addColorStop(0, '#78593a'); g.addColorStop(1, '#45301e');
  ctx.fillStyle = g; ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = '#9c7a56'; ctx.fillRect(0, GROUND, VW, 4);

  const ps = 35;
  const pstart = Math.floor(cam / ps) - 1;
  for (let k = pstart; k < pstart + VW / ps + 3; k++) {
    const x = k * ps + hash(k) * ps - cam;
    const y = GROUND + 12 + hash(k * 5) * (VH - GROUND - 20);
    ctx.fillStyle = hash(k * 2) > 0.5 ? '#94a3b8' : '#64748b';
    circle(x, y, 2 + hash(k * 9) * 3.5);
  }
}

// 5. Ocean beach (turquoise waves, palm dunes, seagulls & golden sand)
function drawBeachSky() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#0097a7');
  g.addColorStop(0.4, '#26c6da');
  g.addColorStop(0.75, '#ffe082');
  g.addColorStop(1, '#ffcc80');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
  ctx.fillStyle = 'rgba(255, 238, 88, 0.4)'; circle(VW - 150, 110, 80);
  ctx.fillStyle = '#fff59d'; circle(VW - 150, 110, 46);
  for (let i = 0; i < 4; i++) {
    const gx = (((i * 320 + 100 - cam * 0.04) % (VW + 200)) + VW + 200) % (VW + 200) - 100;
    const gy = 60 + i * 25 + Math.sin(time * 2 + i) * 6;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(gx - 8, gy, 8, Math.PI * 1.2, Math.PI * 1.9);
    ctx.arc(gx + 8, gy, 8, Math.PI * 1.1, Math.PI * 1.8);
    ctx.stroke();
  }
  for (const c of clouds) {
    const span = VW + 400;
    const x = (((c.x - cam * c.p) % span) + span) % span - 200;
    drawCloud(x, c.y + 15, c.s);
  }
}
function drawBeachBack() {
  const p = 0.1;
  const oceanTop = GROUND - 110;
  const og = ctx.createLinearGradient(0, oceanTop, 0, GROUND);
  og.addColorStop(0, '#00838f'); og.addColorStop(1, '#00acc1');
  ctx.fillStyle = og; ctx.fillRect(0, oceanTop, VW, GROUND - oceanTop);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  const ws = 120;
  const wstart = Math.floor((cam * p) / ws) - 1;
  for (let k = wstart; k < wstart + VW / ws + 3; k++) {
    const wx = k * ws + Math.sin(time * 3 + k) * 15;
    const x = wx - cam * p;
    ctx.fillRect(x, oceanTop + 20 + hash(k) * 35, 24, 2.5);
  }

  const boatX = (((350 - cam * p) % (VW + 300)) + VW + 300) % (VW + 300) - 100;
  const boatY = oceanTop + 30 + Math.sin(time * 2) * 3;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(boatX - 16, boatY); ctx.lineTo(boatX + 16, boatY); ctx.lineTo(boatX + 10, boatY + 7); ctx.lineTo(boatX - 12, boatY + 7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#37474f'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(boatX, boatY); ctx.lineTo(boatX, boatY - 24); ctx.stroke();
  ctx.fillStyle = '#ff5252';
  ctx.beginPath(); ctx.moveTo(boatX + 1, boatY - 22); ctx.lineTo(boatX + 15, boatY - 5); ctx.lineTo(boatX + 1, boatY - 5); ctx.closePath(); ctx.fill();
}
function drawBeachMid() {
  const p = 0.35;
  ctx.fillStyle = '#ffb74d';
  ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= VW + 20; x += 20) {
    const wx = x + cam * p;
    ctx.lineTo(x, GROUND - 45 - Math.sin(wx * 0.004) * 25 - Math.sin(wx * 0.01) * 12);
  }
  ctx.lineTo(VW + 20, GROUND); ctx.closePath(); ctx.fill();

  const sp = 210;
  const start = Math.floor((cam * p) / sp) - 1;
  for (let k = start; k < start + VW / sp + 3; k++) {
    if (hash(k) < 0.35) continue;
    const wx = k * sp + hash(k * 7) * 80;
    const x = wx - cam * p;
    const y = GROUND - 45 - Math.sin(wx * 0.004) * 25 - Math.sin(wx * 0.01) * 12;
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 12, y - 40, x + 18, y - 75);
    ctx.stroke();
    const headX = x + 18, headY = y - 75;
    ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 4;
    const angles = [-0.8, -0.4, 0, 0.4, 0.8, 1.2, -1.2];
    for (const a of angles) {
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.quadraticCurveTo(headX + Math.cos(a) * 24, headY - 12 + Math.sin(a) * 10, headX + Math.cos(a) * 36, headY + 12 + Math.sin(a) * 16);
      ctx.stroke();
    }
  }
}
function drawBeachGround() {
  ctx.fillStyle = '#ffe082'; ctx.fillRect(0, GROUND - 50, VW, 50);
  const sp = 130;
  const start = Math.floor(cam / sp) - 1;
  ctx.fillStyle = '#d7ccc8';
  for (let k = start; k < start + VW / sp + 3; k++) {
    ctx.fillRect(k * sp - cam, GROUND - 46, 12, 38);
  }
  ctx.strokeStyle = '#bcaaa4'; ctx.lineWidth = 3.5;
  for (let k = start; k < start + VW / sp + 3; k++) {
    const x1 = k * sp - cam + 6;
    const x2 = (k + 1) * sp - cam + 6;
    ctx.beginPath();
    ctx.moveTo(x1, GROUND - 36);
    ctx.quadraticCurveTo((x1 + x2) / 2, GROUND - 24, x2, GROUND - 36);
    ctx.stroke();
  }

  const g = ctx.createLinearGradient(0, GROUND, 0, VH);
  g.addColorStop(0, '#ffd54f'); g.addColorStop(1, '#ff8f00');
  ctx.fillStyle = g; ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = '#fff176'; ctx.fillRect(0, GROUND, VW, 4);

  const ps = 45;
  const pstart = Math.floor(cam / ps) - 1;
  for (let k = pstart; k < pstart + VW / ps + 3; k++) {
    const x = k * ps + hash(k) * ps - cam;
    const y = GROUND + 14 + hash(k * 5) * (VH - GROUND - 24);
    const col = ['#ffffff', '#ff8a80', '#80deea', '#ffe082'][Math.abs(k) % 4];
    ctx.fillStyle = col;
    circle(x, y, 2 + hash(k * 9) * 2.5);
  }
}

function drawEnvironment(bgKey) {
  if (bgKey === 'skate') {
    drawSkateSky();
    drawSkateBack();
    drawSkateMid();
    drawSkateGround();
  } else if (bgKey === 'urban') {
    drawUrbanSky();
    drawUrbanBack();
    drawUrbanMid();
    drawUrbanGround();
  } else if (bgKey === 'mountain') {
    drawMountainSky();
    drawMountainBack();
    drawMountainMid();
    drawMountainGround();
  } else if (bgKey === 'beach') {
    drawBeachSky();
    drawBeachBack();
    drawBeachMid();
    drawBeachGround();
  } else {
    drawFarmSky();
    drawFarmBack();
    drawFarmMid();
    drawFarmGround();
  }
}

function drawRamp(r, bgKey = 'farm') {
  const x0 = r.x - cam;
  if (x0 > VW + 50 || x0 + r.len + r.back < -50) return;
  ctx.beginPath(); ctx.moveTo(x0, GROUND);
  for (let i = 0; i <= 24; i++) { const u = i / 24; ctx.lineTo(x0 + u * r.len, GROUND - r.h * u * u); }
  ctx.lineTo(x0 + r.len + r.back, GROUND); ctx.closePath();

  let c1 = '#d09252', c2 = '#8a5527', lip = '#ecb77c';
  if (bgKey === 'skate') { c1 = '#78909c'; c2 = '#455a64'; lip = '#eceff1'; }
  else if (bgKey === 'urban') { c1 = '#5d4037'; c2 = '#271c19'; lip = '#fbc02d'; }
  else if (bgKey === 'mountain') { c1 = '#6d4c2f'; c2 = '#3e2723'; lip = '#bcaaa4'; }
  else if (bgKey === 'beach') { c1 = '#d7ccc8'; c2 = '#8d6e63'; lip = '#fff9c4'; }

  const g = ctx.createLinearGradient(0, GROUND - r.h, 0, GROUND);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = lip; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const u = i / 24; const px = x0 + u * r.len, py = GROUND - r.h * u * u; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
  // flag on the lip
  const fx = x0 + r.len + 14, fy = GROUND - r.h * 0.75;
  ctx.strokeStyle = '#444'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 55); ctx.stroke();
  ctx.fillStyle = r.flag;
  ctx.beginPath(); ctx.moveTo(fx, fy - 55); ctx.lineTo(fx + 30 + Math.sin(time * 8) * 3, fy - 46); ctx.lineTo(fx, fy - 37); ctx.closePath(); ctx.fill();
}

function drawParticles() {
  for (const p of particles) {
    const x = p.x - cam;
    const a = clamp(p.life / p.max, 0, 1);
    if (p.type === 'dust') {
      const col = p.color || '190,140,90';
      ctx.fillStyle = `rgba(${col},${a * 0.8})`; circle(x, p.y, p.size);
    } else {
      ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = a;
      ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
  }
}

function drawTexts() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (const t of texts) {
    const pop = t.age < 0.15 ? 0.5 + (t.age / 0.15) * 0.7 : t.age < 0.3 ? 1.2 - ((t.age - 0.15) / 0.15) * 0.2 : 1;
    const a = t.age > t.max - 0.4 ? (t.max - t.age) / 0.4 : 1;
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
    ctx.translate(t.x, t.y); ctx.scale(pop, pop);
    ctx.font = `700 ${t.size}px Fredoka, "Arial Rounded MT Bold", sans-serif`;
    ctx.strokeStyle = '#222'; ctx.lineWidth = 9; ctx.strokeText(t.text, 0, 0);
    ctx.fillStyle = t.color; ctx.fillText(t.text, 0, 0);
    ctx.restore();
  }
}

// ---------- drawing: bike + rider ----------
// Local coords: origin on the ground between the wheels, -y is up.
const POSES = {
  ride:     { hip: [-10, -55], sh: [8, -78], head: [15, -90], hn: [12, -57], hf: [12, -57], fn: null, ff: null },
  tuck:     { hip: [-6, -50],  sh: [7, -71], head: [14, -83], hn: [12, -57], hf: [12, -57], fn: null, ff: null },
  nohander: { hip: [-10, -57], sh: [5, -80], head: [11, -92], hn: [18, -103], hf: [-4, -102], fn: null, ff: null },
  superman: { hip: [-26, -72], sh: [0, -68], head: [9, -77],  hn: [12, -57], hf: [12, -57], fn: [-54, -76], ff: [-52, -66] },
  whip:     { hip: [-6, -64],  sh: [8, -82], head: [14, -94], hn: [12, -57], hf: [12, -57], fn: [-22, -46], ff: [6, -48] },
  wobble:   { hip: [-12, -56], sh: [4, -79], head: [8, -91],  hn: [24, -96], hf: [-14, -94], fn: null, ff: null },
  release:  { hip: [-6, -52],  sh: [6, -72], head: [14, -84], hn: [5, -68],  hf: [1, -68],   fn: null, ff: null },
  indy:     { hip: [-12, -52], sh: [4, -75], head: [12, -87], hn: [-10, -47], hf: [12, -57], fn: null, ff: null },
  cancan:   { hip: [-4, -58],  sh: [7, -79], head: [14, -91], hn: [12, -57], hf: [12, -57], fn: [28, -50], ff: null },
  feetoff:  { hip: [-8, -60],  sh: [8, -80], head: [15, -92], hn: [12, -57], hf: [12, -57], fn: [-1, -30], ff: [-14, -28] },
  xup:      { hip: [-8, -54],  sh: [7, -76], head: [14, -88], hn: [16, -60], hf: [8, -55],  fn: null, ff: null },
};

const P = (a) => ({ x: a[0], y: a[1] });
const lerpP = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

function getPose() {
  const c = rider.crank + (rider.crankExtra || 0), bb = { x: -3, y: -17 };
  const pn = { x: bb.x + Math.cos(c) * 8, y: bb.y + Math.sin(c) * 8 };
  const pf = { x: bb.x - Math.cos(c) * 8, y: bb.y - Math.sin(c) * 8 };
  const base = POSES.ride, tgt = POSES[rider.pose] || base, t = rider.blend;
  const o = {};
  for (const k of ['hip', 'sh', 'head', 'hn', 'hf']) o[k] = lerpP(P(base[k]), P(tgt[k]), t);
  o.fn = lerpP(pn, tgt.fn ? P(tgt.fn) : pn, t);
  o.ff = lerpP(pf, tgt.ff ? P(tgt.ff) : pf, t);
  if (rider.pose === 'wobble') {
    o.hn.x += Math.sin(time * 22) * 7 * t; o.hn.y += Math.cos(time * 19) * 7 * t;
    o.hf.x += Math.cos(time * 24) * 7 * t; o.hf.y += Math.sin(time * 21) * 7 * t;
  }
  const bob = phase !== 'air' ? Math.sin(rider.crank * 2) * 0.8 : 0;
  o.hip.y += bob; o.sh.y += bob; o.head.y += bob;
  o.pn = pn; o.pf = pf;
  return o;
}

function ik(a, b, l1, l2, dir) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = clamp(Math.hypot(dx, dy), 0.01, l1 + l2 - 0.01);
  const ang = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const j = ang + dir * A;
  return { x: a.x + Math.cos(j) * l1, y: a.y + Math.sin(j) * l1 };
}

function limb(a, b, l1, l2, dir, color, w) {
  const j = ik(a, b, l1, l2, dir);
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(j.x, j.y); ctx.lineTo(b.x, b.y); ctx.stroke();
}

function seg(x1, y1, x2, y2, color, w) {
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function drawWheel(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rider.wheel);
  ctx.strokeStyle = '#222'; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(0, 0, 15.8, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(0, 0, 12.5, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 12.5, Math.sin(a) * 12.5); ctx.stroke();
  }
  ctx.fillStyle = '#666'; circle(0, 0, 2.5);
  ctx.restore();
}

function drawBike(color, pose) {
  // front end (stays put during a tailwhip)
  drawWheel(28, -18);
  seg(17, -35, 28, -18, '#cfcfcf', 3.5);

  // rear end + frame (spins during a tailwhip or kicks out during a whip)
  ctx.save();
  if (rider.whip) {
    ctx.translate(17, 0); ctx.scale(Math.cos(rider.whip), 1); ctx.translate(-17, 0);
  } else if (rider.lay) {
    ctx.translate(17, 0); ctx.scale(Math.cos(rider.lay * 0.9), 1); ctx.translate(-17, 0);
  }
  drawWheel(-28, -18);
  ctx.strokeStyle = color; ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-28, -18); ctx.lineTo(-3, -17); ctx.lineTo(17, -35); ctx.lineTo(15, -44);
  ctx.lineTo(-13, -40); ctx.lineTo(-3, -17);
  ctx.moveTo(-13, -40); ctx.lineTo(-28, -18);
  ctx.stroke();
  seg(-19, -43, -7, -44, '#222', 4.5); // seat
  seg(pose.pf.x, pose.pf.y, pose.pn.x, pose.pn.y, '#555', 3); // cranks
  seg(pose.pn.x - 3, pose.pn.y, pose.pn.x + 3, pose.pn.y, '#222', 3);
  ctx.restore();

  // bars + number plate (rotates/spins during bar spin, bar turn, x-up)
  seg(15, -44, 12, -57, '#333', 3.5);
  ctx.save();
  if (rider.bar) {
    ctx.translate(12, -57);
    ctx.scale(Math.cos(rider.bar), 1);
    ctx.translate(-12, 57);
  }
  seg(8, -57, 17, -59, '#333', 4);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(16, -56, 11, 10, 2) : ctx.rect(16, -56, 11, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#222'; ctx.font = '700 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('7', 21.5, -50.5);
  ctx.restore();
}

function drawRider() {
  const sx = VW * RIDER_X_FRAC;
  const sy = GROUND - rider.y;
  let ang = rider.angle;
  if (rider.wobbleT > 0) ang += Math.sin(time * 28) * 0.12 * rider.wobbleT;

  // shadow on the ground
  const gh = groundHeightAt(rider.x);
  const air = rider.y - gh;
  ctx.fillStyle = `rgba(0,0,0,${clamp(0.3 - air / 900, 0.06, 0.3)})`;
  ctx.beginPath(); ctx.ellipse(sx, GROUND - gh + 2, Math.max(20, 60 - air / 6), 7, 0, 0, Math.PI * 2); ctx.fill();

  const color = settings.color;
  const skin = '#f5c99b', pants = '#263a5a';
  const pose = getPose();

  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(BIKE_SCALE, BIKE_SCALE * (1 - 0.1 * rider.squash));
  ctx.translate(0, -32);
  ctx.rotate(ang);
  if (rider.spin) {
    const c = Math.cos(rider.spin);
    ctx.scale(c < 0 ? Math.min(-0.2, c) : Math.max(0.2, c), 1);
  }
  if (rider.lay) {
    ctx.rotate(-rider.lay * 0.35);
  }
  ctx.translate(0, 32);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // far side limbs
  limb(pose.hip, pose.ff, 23, 23, -1, shade(pants, -25), 7);
  ctx.fillStyle = '#111'; circle(pose.ff.x + 1, pose.ff.y, 3.5);
  limb(pose.sh, pose.hf, 15, 15, 1, shade(color, -50), 5);

  drawBike(color, pose);

  // near leg
  limb(pose.hip, pose.fn, 23, 23, -1, pants, 7.5);
  ctx.fillStyle = '#111'; circle(pose.fn.x + 1, pose.fn.y, 3.8);

  // torso
  seg(pose.hip.x, pose.hip.y, pose.sh.x, pose.sh.y, color, 12);
  seg(pose.hip.x, pose.hip.y, pose.hip.x + (pose.sh.x - pose.hip.x) * 0.15, pose.hip.y + (pose.sh.y - pose.hip.y) * 0.15, pants, 12);

  // head + helmet
  const h = pose.head;
  ctx.fillStyle = skin; circle(h.x, h.y, 8.5);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(h.x, h.y - 1, 10, Math.PI * 0.95, Math.PI * 2.08); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(h.x - 6, h.y - 11, 4, 10);
  seg(h.x + 3, h.y - 4, h.x + 13, h.y - 3, '#222', 2.5); // visor
  ctx.fillStyle = '#222'; circle(h.x + 4.5, h.y + 0.5, 1.3);
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(h.x + 4, h.y + 3, 3, 0.1 * Math.PI, 0.7 * Math.PI); ctx.stroke();

  // near arm
  limb(pose.sh, pose.hn, 15, 15, 1, color, 5.5);
  ctx.fillStyle = skin; circle(pose.hn.x, pose.hn.y, 3);

  ctx.restore();
}

function draw() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (bgTransition.active) {
    drawEnvironment(bgTransition.from);
    for (const r of ramps) drawRamp(r, bgTransition.from);
    ctx.save();
    ctx.globalAlpha = ease(clamp(bgTransition.t / bgTransition.dur, 0, 1));
    drawEnvironment(bgTransition.to);
    for (const r of ramps) drawRamp(r, bgTransition.to);
    ctx.restore();
  } else {
    drawEnvironment(currentBg);
    for (const r of ramps) drawRamp(r, currentBg);
  }
  drawRider();
  drawParticles();
  drawTexts();
}

// ---------- UI ----------
const ui = {
  hud: $('hud'), score: $('hud-score'), jump: $('hud-jump'), streak: $('hud-streak'), lives: $('hud-lives'),
  quiz: $('quiz'), qText: $('q-text'), qAnswer: $('q-answer'), timerFill: $('timer-fill'),
  trickLabel: $('trick-label'), feedback: $('feedback'), pad: $('pad'),
  menu: $('menu'), results: $('results'),
};

function updateHUD() {
  if (!game) return;
  ui.score.textContent = `⭐ ${game.score}`;
  if (settings.level === 'dynamic') {
    ui.jump.textContent = `Jump ${game.jump + 1}`;
    ui.lives.classList.remove('hidden');
    const hearts = game.missStreak === 0 ? '❤️❤️❤️' : game.missStreak === 1 ? '❤️❤️🖤' : '❤️🖤🖤';
    ui.lives.textContent = hearts;
    ui.streak.textContent = `🔥 Streak: ${game.streak} (Lvl ${game.diffStage})`;
    ui.streak.classList.remove('hidden');
  } else {
    ui.jump.textContent = `Jump ${Math.min(game.jump + 1, TOTAL_JUMPS)} / ${TOTAL_JUMPS}`;
    ui.lives.classList.add('hidden');
    ui.streak.textContent = `🔥 ${game.streak} in a row!`;
    ui.streak.classList.toggle('hidden', game.streak < 2);
  }
}

function showQuiz() {
  ui.qText.textContent = problem.text;
  renderAnswer();
  ui.qAnswer.className = '';
  ui.feedback.textContent = ''; ui.feedback.className = '';
  ui.timerFill.parentElement.classList.remove('hidden');
  ui.trickLabel.classList.remove('hidden');
  lastLabel = '';
  ui.quiz.classList.remove('hidden');
  // restart the pop animation
  ui.quiz.style.animation = 'none'; void ui.quiz.offsetWidth; ui.quiz.style.animation = '';
  ui.pad.classList.remove('hidden');
}

function hideQuiz() {
  ui.quiz.classList.add('hidden');
  ui.pad.classList.add('hidden');
}

function renderAnswer() { ui.qAnswer.textContent = typed === '' ? '?' : typed; }

function showFeedback(ok, elapsed) {
  ui.pad.classList.add('hidden');
  ui.timerFill.parentElement.classList.add('hidden');
  ui.trickLabel.classList.add('hidden');
  if (ok) {
    ui.qAnswer.className = 'ok';
    ui.feedback.className = 'ok';
    const extra = settings.level === 'dynamic' ? ` (Lvl ${game.diffStage}!)` : '';
    ui.feedback.textContent = `✅ Correct! (${elapsed.toFixed(1)} sec)${extra}`;
  } else {
    ui.qAnswer.className = 'bad';
    ui.feedback.className = 'bad';
    if (settings.level === 'dynamic') {
      const left = 3 - game.missStreak;
      if (left > 0) {
        ui.feedback.textContent = `Oops! ${problem.text} = ${problem.answer} (${left} heart${left === 1 ? '' : 's'} left!)`;
      } else {
        ui.feedback.textContent = `💥 3 misses in a row! (${problem.text} = ${problem.answer})`;
      }
    } else {
      ui.feedback.textContent = `Oops! ${problem.text} = ${problem.answer}`;
    }
  }
}

let lastLabel = '';
function updateTimerUI() {
  const e = (performance.now() - qStart) / 1000;
  const th = getThresholds();
  const key = tierForTime(e);
  ui.timerFill.style.width = `${clamp(1 - e / th[3], 0, 1) * 100}%`;
  if (key !== lastLabel) {
    lastLabel = key;
    ui.timerFill.style.background = TIER_COLOR[key];
    ui.trickLabel.textContent = `Answer now for: ${TIER_LABEL[key]}`;
    ui.trickLabel.style.color = TIER_COLOR[key];
  }
}

function typeDigit(d) {
  if (phase !== 'question' || typed.length >= 3) return;
  typed += d; renderAnswer(); sfx.key();
}
function backspace() {
  if (phase !== 'question') return;
  typed = typed.slice(0, -1); renderAnswer(); sfx.key();
}

// number pad
function buildPad() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'del', 'go'];
  for (const k of keys) {
    const b = document.createElement('button');
    b.className = 'key' + (k === 'del' ? ' del' : k === 'go' ? ' go' : '');
    b.textContent = k === 'del' ? '⌫' : k === 'go' ? 'GO!' : k;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio();
      if (k === 'del') backspace(); else if (k === 'go') submit(); else typeDigit(k);
    });
    ui.pad.appendChild(b);
  }
}

addEventListener('keydown', (e) => {
  if (mode === 'menu' && e.key === 'Enter') { startGame(); return; }
  if (mode !== 'play') return;
  if (/^[0-9]$/.test(e.key)) typeDigit(e.key);
  else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
  else if (e.key === 'Enter') submit();
});

// menu
function buildMenu() {
  const lv = $('levels');
  lv.innerHTML = '';
  for (const [key, L] of Object.entries(LEVELS)) {
    const b = document.createElement('button');
    b.className = 'level' + (key === 'dynamic' ? ' dynamic' : '') + (settings.level === key ? ' sel' : '');
    b.innerHTML = `<b>${L.name}</b><small>${L.desc}</small>`;
    b.onclick = () => { settings.level = key; localStorage.setItem('bmx_level', key); buildMenu(); };
    lv.appendChild(b);
  }
  const cs = $('colors');
  cs.innerHTML = '';
  for (const c of COLORS) {
    const s = document.createElement('div');
    s.className = 'swatch' + (settings.color === c ? ' sel' : '');
    s.style.background = c;
    s.onclick = () => { settings.color = c; localStorage.setItem('bmx_color', c); buildMenu(); };
    cs.appendChild(s);
  }
  if (settings.level === 'dynamic') {
    $('guide').innerHTML = `
      <div class="guide-row" style="background:#ff6d00">
        <div class="guide-row-head"><span>⚡ Dynamic Endless Mode</span><span>Adaptive</span></div>
        <div class="guide-row-tricks">Starts easy (+ up to 7) & gets harder as your streak continues! Drops a level on a miss. 3 misses in a row = Wipeout!</div>
      </div>` + TIER_ORDER.map((k) => {
        const tier = TIERS[k];
        const list = tier.tricks.map((t) => t.name.replace(/!+$/, '')).join(', ');
        return `<div class="guide-row" style="background:${tier.color}">
          <div class="guide-row-head"><span>${tier.label}</span></div>
          <div class="guide-row-tricks">${list}</div>
        </div>`;
      }).join('');
  } else {
    const th = LEVELS[settings.level].th;
    $('guide').innerHTML = TIER_ORDER.map((k, i) => {
      const tier = TIERS[k];
      const timeText = i < th.length ? `under ${th[i]} sec` : 'slower';
      const list = tier.tricks.map((t) => t.name.replace(/!+$/, '')).join(', ');
      return `<div class="guide-row" style="background:${tier.color}">
        <div class="guide-row-head"><span>${tier.label}</span><span>${timeText}</span></div>
        <div class="guide-row-tricks">${list}</div>
      </div>`;
    }).join('') + `<div class="guide-row" style="background:${TIERS.wobble.color}">
      <div class="guide-row-head"><span>❌ Wrong answer</span><span>wobbly hop</span></div>
    </div>`;
  }
  const best = +localStorage.getItem('bmx_best_' + settings.level) || 0;
  $('best-line').textContent = best ? `🏆 Best ${LEVELS[settings.level].name} score: ${best}` : '';
}

function startGame() {
  audio();
  ui.menu.classList.add('hidden');
  ui.results.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  newGame();
  currentBg = BACKGROUNDS[randInt(0, BACKGROUNDS.length - 1)];
  bgTransition.active = false;
  resetWorld();
  mode = 'play';
  updateHUD();
}

function goMenu() {
  mode = 'menu';
  hideQuiz();
  ui.hud.classList.add('hidden');
  ui.results.classList.add('hidden');
  ui.menu.classList.remove('hidden');
  resetWorld();
  buildMenu();
}

function showResults() {
  sfx.fanfare();
  mode = 'results';
  ui.hud.classList.add('hidden');
  hideQuiz();
  let stars, title;
  if (settings.level === 'dynamic') {
    stars = game.jump >= 20 ? 3 : game.jump >= 10 ? 2 : 1;
    title = game.missStreak >= 3
      ? (game.jump >= 20 ? 'HEROIC RUN! 🌟' : game.jump >= 10 ? 'AWESOME RIDE! 🤘' : 'WIPEOUT! 💥')
      : 'INCREDIBLE! 🏆';
  } else {
    stars = game.correct >= 9 ? 3 : game.correct >= 6 ? 2 : 1;
    title = stars === 3 ? 'LEGENDARY RIDE! 🏆' : stars === 2 ? 'Awesome riding! 🤘' : 'Nice job! Keep practicing! 💪';
  }
  $('res-title').textContent = title;
  $('res-stars').innerHTML = [0, 1, 2].map((i) => `<span class="${i < stars ? '' : 'off'}">⭐</span>`).join('');
  $('res-score').textContent = `${game.score} points`;
  const key = 'bmx_best_' + settings.level;
  const prev = +localStorage.getItem(key) || 0;
  const isBest = game.score > prev;
  if (isBest) localStorage.setItem(key, game.score);
  $('res-best').classList.toggle('hidden', !isBest || game.score === 0);
  const bestTrick = game.bestTrickName ? game.bestTrickName : (game.bestTrickIdx < 99 ? TIER_LABEL[TIER_ORDER[game.bestTrickIdx]] : '—');
  if (settings.level === 'dynamic') {
    $('res-stats').innerHTML = `
      <div>Jumps survived<b>${game.jump}</b></div>
      <div>Max streak<b>🔥 ${game.bestStreak}</b></div>
      <div>Highest level<b>Level ${game.maxStage}</b></div>
      <div>Best trick<b style="font-size:20px">${bestTrick}</b></div>`;
  } else {
    $('res-stats').innerHTML = `
      <div>Correct<b>${game.correct} / ${TOTAL_JUMPS}</b></div>
      <div>Best streak<b>🔥 ${game.bestStreak}</b></div>
      <div>Fastest answer<b>${game.fastest !== null ? game.fastest.toFixed(1) + ' sec' : '—'}</b></div>
      <div>Best trick<b style="font-size:20px">${bestTrick}</b></div>`;
  }
  ui.results.classList.remove('hidden');
}

$('btn-start').onclick = startGame;
$('btn-again').onclick = startGame;
$('btn-menu').onclick = goMenu;
$('btn-home').onclick = goMenu;
const muteBtn = $('btn-mute');
muteBtn.textContent = muted ? '🔇' : '🔊';
muteBtn.onclick = () => {
  muted = !muted;
  localStorage.setItem('bmx_muted', muted ? '1' : '0');
  muteBtn.textContent = muted ? '🔇' : '🔊';
};

// ---------- main loop ----------
buildPad();
buildMenu();
resetWorld();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
