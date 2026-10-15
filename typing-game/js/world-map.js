// Animated Prehistoric World Map for Dino Keys
// Renders an illustrated, winding exploration path across 7 prehistoric biomes
// with animated environmental details, stepping stone level nodes, player dino avatar,
// floating biome jump bar, and rich level preview modal.

import { WORLDS, LEVELS, getLevel, getWorld, currentLevel, isUnlocked } from './curriculum.js';
import { getDino, SPECIES_NAMES } from './dinos.js';
import { dinoSVG, shade, playBallSVG, butterflySVG } from './dino-art.js';
import { sfx, say } from './audio.js';
import { totalStars } from './storage.js';

export const MAP_WIDTH = 760;
export const MAP_HEIGHT = 5400;

export const BIOMES = [
  {
    id: 'nest',
    worldIndex: 0,
    name: 'Egg Nest',
    title: 'Nesting Grounds',
    theme: 'nest',
    ages: 'Ages 4+',
    blurb: 'Find the glowing keys to hatch baby dinos!',
    icon: '🐣',
    yStart: 5200,
    yEnd: 4620,
    bannerY: 5310,
    accent: '#ff922b',
    pathColor: '#e8590c',
    pathBg: '#ffe8cc',
    bgGradient: ['#fff4e6', '#ffd8a8', '#ffa94d'],
  },
  {
    id: 'meadow',
    worldIndex: 1,
    name: 'Home Row Meadow',
    title: 'Sunny Meadow',
    theme: 'meadow',
    ages: 'Ages 5+',
    blurb: 'Keep your fingers on the home row and walk through the meadow.',
    icon: '🌿',
    yStart: 4440,
    yEnd: 3740,
    bannerY: 4540,
    accent: '#51cf66',
    pathColor: '#2b8a3e',
    pathBg: '#d3f9d8',
    bgGradient: ['#ebfbee', '#b2f2bb', '#69db7c'],
  },
  {
    id: 'jungle',
    worldIndex: 2,
    name: 'Top Row Jungle',
    title: 'Dino Jungle',
    theme: 'jungle',
    ages: 'Ages 6+',
    blurb: 'Reach up to the top row and swing through the jungle.',
    icon: '🌴',
    yStart: 3560,
    yEnd: 2720,
    bannerY: 3660,
    accent: '#20c997',
    pathColor: '#099268',
    pathBg: '#c3fae8',
    bgGradient: ['#e6fcf5', '#96f2d7', '#38d9a9'],
  },
  {
    id: 'volcano',
    worldIndex: 3,
    name: 'Bottom Row Volcano',
    title: 'Lava Volcano',
    theme: 'volcano',
    ages: 'Ages 7+',
    blurb: 'Reach down to the bottom row – watch out for lava!',
    icon: '🌋',
    yStart: 2540,
    yEnd: 1720,
    bannerY: 2640,
    accent: '#ff6b6b',
    pathColor: '#c92a2a',
    pathBg: '#ffe3e3',
    bgGradient: ['#fff5f5', '#ffc9c9', '#ff8787'],
  },
  {
    id: 'canyon',
    worldIndex: 4,
    name: 'Capital Canyon',
    title: 'Echo Canyon',
    theme: 'canyon',
    ages: 'Ages 7+',
    blurb: 'Capital letters, sentences and punctuation.',
    icon: '🏜️',
    yStart: 1540,
    yEnd: 1040,
    bannerY: 1640,
    accent: '#fcc419',
    pathColor: '#e67700',
    pathBg: '#fff3bf',
    bgGradient: ['#fff9db', '#ffec99', '#ffd43b'],
  },
  {
    id: 'mountain',
    worldIndex: 5,
    name: 'Number Mountain',
    title: 'Crystal Mountain',
    theme: 'mountain',
    ages: 'Ages 8+',
    blurb: 'Climb up to the number row.',
    icon: '🏔️',
    yStart: 920,
    yEnd: 560,
    bannerY: 990,
    accent: '#339af0',
    pathColor: '#1864ab',
    pathBg: '#d0ebff',
    bgGradient: ['#e7f5ff', '#a5d8ff', '#4dabf7'],
  },
  {
    id: 'sky',
    worldIndex: 6,
    name: 'Sky Race',
    title: 'Cloud Peak',
    theme: 'sky',
    ages: 'Ages 8+',
    blurb: 'Fly with the pterodactyls. How fast can you type?',
    icon: '☁️',
    yStart: 460,
    yEnd: 100,
    bannerY: 520,
    accent: '#845ef7',
    pathColor: '#5f3dc4',
    pathBg: '#e5dbff',
    bgGradient: ['#f3f0ff', '#d0bfff', '#9775fa'],
  },
];

/**
 * Catalogue of friendly animated dinosaurs playing across each biome in the background.
 */
export const BACKGROUND_DINOS = [
  {
    id: 'bg-trixie',
    dinoId: 'trixie',
    name: 'Trixie',
    biome: 'nest',
    x: 630,
    y: 5120,
    action: 'play-ball',
    facing: 'left',
    speech: "Catch the ball! You're doing great on the home row!",
    prop: 'ball',
  },
  {
    id: 'bg-steggy',
    dinoId: 'steggy',
    name: 'Steggy',
    biome: 'nest',
    x: 100,
    y: 4940,
    action: 'peek-fern',
    facing: 'right',
    speech: "Peek-a-boo! Hatch all the baby dino eggs!",
    prop: 'fern',
  },
  {
    id: 'bg-bronty',
    dinoId: 'bronty',
    name: 'Bronty',
    biome: 'meadow',
    x: 650,
    y: 4320,
    action: 'munch-leaves',
    facing: 'left',
    speech: "Munch munch! Prehistoric leaves are yummy!",
    prop: 'leaves',
  },
  {
    id: 'bg-clover',
    dinoId: 'clover',
    name: 'Clover',
    biome: 'meadow',
    x: 120,
    y: 4000,
    action: 'chase-butterfly',
    facing: 'right',
    speech: "Flutter flutter! I almost caught the yellow butterfly!",
    prop: 'butterfly',
  },
  {
    id: 'bg-mango',
    dinoId: 'mango',
    name: 'Mango',
    biome: 'jungle',
    x: 640,
    y: 3480,
    action: 'juggle-coconuts',
    facing: 'left',
    speech: "Ta-da! Jungle tricks! Keep that typing rhythm!",
    prop: 'coconuts',
  },
  {
    id: 'bg-anky',
    dinoId: 'anky',
    name: 'Anky',
    biome: 'jungle',
    x: 110,
    y: 2960,
    action: 'log-drum',
    facing: 'right',
    speech: "Tap-tap-TAP! Play the jungle beat with all your fingers!",
    prop: 'log',
  },
  {
    id: 'bg-ember',
    dinoId: 'ember',
    name: 'Ember',
    biome: 'volcano',
    x: 130,
    y: 2260,
    action: 'roast-marshmallow',
    facing: 'right',
    speech: "Warm and gooey toasted marshmallow! Watch out for lava!",
    prop: 'marshmallow',
  },
  {
    id: 'bg-dusty',
    dinoId: 'dusty',
    name: 'Dusty',
    biome: 'canyon',
    x: 640,
    y: 1380,
    action: 'canyon-slide',
    facing: 'left',
    speech: "Wheeeee! Sliding down the sandstone dunes is so fun!",
    prop: 'dust',
  },
  {
    id: 'bg-sunny',
    dinoId: 'sunny',
    name: 'Sunny',
    biome: 'canyon',
    x: 130,
    y: 1160,
    action: 'arch-peek',
    facing: 'right',
    speech: "Echooooo! You're climbing so high, keep going!",
    prop: 'arch',
  },
  {
    id: 'bg-frosty',
    dinoId: 'frosty',
    name: 'Frosty',
    biome: 'mountain',
    x: 620,
    y: 840,
    action: 'ice-skate',
    facing: 'left',
    speech: "Triple axel! Cold ice, warm heart! Numbers are easy!",
    prop: 'pond',
  },
  {
    id: 'bg-zephyr',
    dinoId: 'zephyr',
    name: 'Zephyr',
    biome: 'sky',
    x: 640,
    y: 420,
    action: 'sky-fly',
    facing: 'left',
    speech: "Soar with the wind! Full speed touch typing champion!",
    prop: 'wind',
  },
  {
    id: 'bg-petra',
    dinoId: 'petra',
    name: 'Petra',
    biome: 'sky',
    x: 130,
    y: 180,
    action: 'cloud-surf',
    facing: 'right',
    speech: "Surfing the clouds! You are almost at the summit star!",
    prop: 'cloud',
  },
];

export function renderBgDinoProp(prop) {
  switch (prop) {
    case 'ball':
      return `<div class="bg-prop prop-ball">${playBallSVG()}</div>`;
    case 'butterfly':
      return `<div class="bg-prop prop-butterfly">${butterflySVG()}</div>`;
    case 'marshmallow':
      return `
        <div class="bg-prop prop-marshmallow">
          <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="6" y1="38" x2="36" y2="8" stroke="#8d5b2d" stroke-width="3.5" stroke-linecap="round"/>
            <ellipse cx="30" cy="14" rx="8" ry="6" fill="#fff" stroke="#f59f00" stroke-width="1.8"/>
            <ellipse cx="32" cy="13" rx="4" ry="3" fill="#b45309" opacity=".5"/>
          </svg>
        </div>`;
    case 'coconuts':
      return `
        <div class="bg-prop prop-coconuts">
          <svg viewBox="0 0 44 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="14" cy="14" r="10" fill="#78350f" stroke="#451a03" stroke-width="2"/>
            <circle cx="12" cy="10" r="1.5" fill="#451a03"/>
            <circle cx="15" cy="10" r="1.5" fill="#451a03"/>
            <circle cx="30" cy="13" r="9" fill="#92400e" stroke="#451a03" stroke-width="2"/>
            <circle cx="28" cy="9" r="1.5" fill="#451a03"/>
          </svg>
        </div>`;
    case 'leaves':
      return `
        <div class="bg-prop prop-leaves">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 36 Q 20 20 36 6 Q 16 10 4 36" fill="#2b8a3e" stroke="#087f5b" stroke-width="1.5"/>
            <path d="M12 28 Q 28 16 38 18" stroke="#51cf66" stroke-width="2" fill="none"/>
          </svg>
        </div>`;
    case 'log':
      return `
        <div class="bg-prop prop-log">
          <svg viewBox="0 0 54 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="4" y="6" width="46" height="16" rx="6" fill="#78350f" stroke="#451a03" stroke-width="2"/>
            <ellipse cx="8" cy="14" rx="3" ry="6" fill="#92400e"/>
            <path d="M16 10 L 40 10 M 20 18 L 44 18" stroke="#451a03" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 6 Q 26 2 32 6" fill="#2b8a3e"/>
          </svg>
        </div>`;
    case 'pond':
      return `
        <div class="bg-prop prop-pond">
          <svg viewBox="0 0 90 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="45" cy="16" rx="42" ry="14" fill="#a5d8ff" stroke="#339af0" stroke-width="2.5" opacity=".75"/>
            <ellipse cx="45" cy="16" rx="34" ry="10" fill="#d0ebff" opacity=".8"/>
            <path d="M25 14 Q 38 10 52 14 M 40 20 Q 55 16 68 20" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </div>`;
    case 'cloud':
      return `
        <div class="bg-prop prop-cloud">
          <svg viewBox="0 0 84 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="42" cy="18" rx="38" ry="12" fill="#fff" stroke="#d0bfff" stroke-width="2"/>
            <circle cx="28" cy="12" r="12" fill="#fff"/>
            <circle cx="52" cy="10" r="14" fill="#fff"/>
          </svg>
        </div>`;
    case 'fern':
      return `
        <div class="bg-prop prop-fern">
          <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 40 Q 20 20 38 4 Q 18 16 4 40" fill="#2b8a3e"/>
            <path d="M10 40 Q 30 24 40 12 Q 24 24 10 40" fill="#51cf66"/>
            <path d="M16 40 Q 34 30 42 22 Q 28 30 16 40" fill="#20c997"/>
          </svg>
        </div>`;
    case 'dust':
      return `
        <div class="bg-prop prop-dust">
          <svg viewBox="0 0 50 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="16" cy="18" rx="10" ry="7" fill="#ffd8a8" opacity=".7"/>
            <ellipse cx="28" cy="16" rx="12" ry="8" fill="#ffd8a8" opacity=".6"/>
            <ellipse cx="40" cy="20" rx="8" ry="6" fill="#ffd8a8" opacity=".5"/>
          </svg>
        </div>`;
    case 'arch':
      return `
        <div class="bg-prop prop-arch">
          <svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 44 L 10 16 Q 23 4 36 16 L 40 44 Q 28 20 23 20 Q 18 20 6 44 Z" fill="#e8590c" stroke="#d9480f" stroke-width="2"/>
          </svg>
        </div>`;
    case 'wind':
      return `
        <div class="bg-prop prop-wind">
          <svg viewBox="0 0 54 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 14 Q 24 8 40 12 A 6 6 0 1 0 44 6" fill="none" stroke="#d0bfff" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M12 22 Q 28 18 42 20 A 4 4 0 1 0 44 16" fill="none" stroke="#e5dbff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>`;
    default:
      return '';
  }
}

/**
 * Computes deterministic (x, y) coordinates for all levels across all worlds.
 * Produces an alternating S-curve winding trail traversing from bottom to top.
 */
export function computeMapCoordinates(worlds = WORLDS) {
  const levelPoints = [];
  let globalIdx = 0;

  worlds.forEach((world, wi) => {
    const biome = BIOMES.find((b) => b.id === world.id) || BIOMES[wi] || BIOMES[0];
    const n = world.levels.length;

    world.levels.forEach((lvl, li) => {
      const t = n <= 1 ? 0.5 : li / (n - 1);
      // y moves upwards (decreasing y) as li increases
      const y = Math.round(biome.yStart - t * (biome.yStart - biome.yEnd));

      // S-curve oscillation: swings between ~160px and ~600px
      const angle = globalIdx * 0.75;
      const x = Math.round(380 + Math.sin(angle) * 220);

      levelPoints.push({
        id: lvl.id,
        level: lvl,
        world,
        biome,
        x,
        y,
        globalIndex: globalIdx,
        indexInWorld: li,
        isMilestone: Boolean(lvl.reward) || li === n - 1,
      });

      globalIdx++;
    });
  });

  return levelPoints;
}

/**
 * Builds a smooth vertical cubic bezier path from an array of 2D points.
 */
export function pointsToPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const dy = p1.y - p0.y;
    const cp1x = p0.x;
    const cp1y = p0.y + dy * 0.5;
    const cp2x = p1.x;
    const cp2y = p1.y - dy * 0.5;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/**
 * Generates the full scalable SVG background for the world map.
 * Contains biome gradient backdrops, terrain shapes, environmental landmark illustrations,
 * river, bridge, volcano with rising smoke, canyon arches, crystals, clouds, and trail paths.
 */
export function generateMapSVG(levelPoints, currentGlobalIndex = 0) {
  // Trail points including bottom trailhead and top summit nest
  const fullTrailPoints = [
    { x: 380, y: 5360 },
    ...levelPoints.map((p) => ({ x: p.x, y: p.y })),
    { x: 380, y: 50 },
  ];

  const fullPathD = pointsToPath(fullTrailPoints);

  // Unlocked path points up to the current level
  const activeIdx = Math.max(0, Math.min(currentGlobalIndex, levelPoints.length - 1));
  const unlockedTrailPoints = [
    { x: 380, y: 5360 },
    ...levelPoints.slice(0, activeIdx + 1).map((p) => ({ x: p.x, y: p.y })),
  ];
  const unlockedPathD = pointsToPath(unlockedTrailPoints);

  return `
    <svg class="map-svg-canvas" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <!-- Biome vertical background linear gradients -->
        <linearGradient id="grad-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#49306b"/>
          <stop offset="40%" stop-color="#845ef7"/>
          <stop offset="100%" stop-color="#d0bfff"/>
        </linearGradient>
        <linearGradient id="grad-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d0bfff"/>
          <stop offset="25%" stop-color="#a5d8ff"/>
          <stop offset="100%" stop-color="#74c0fc"/>
        </linearGradient>
        <linearGradient id="grad-canyon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#74c0fc"/>
          <stop offset="20%" stop-color="#ffe066"/>
          <stop offset="100%" stop-color="#fab005"/>
        </linearGradient>
        <linearGradient id="grad-volcano" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fab005"/>
          <stop offset="15%" stop-color="#495057"/>
          <stop offset="60%" stop-color="#343a40"/>
          <stop offset="100%" stop-color="#212529"/>
        </linearGradient>
        <linearGradient id="grad-jungle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#212529"/>
          <stop offset="18%" stop-color="#087f5b"/>
          <stop offset="100%" stop-color="#20c997"/>
        </linearGradient>
        <linearGradient id="grad-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#20c997"/>
          <stop offset="20%" stop-color="#51cf66"/>
          <stop offset="100%" stop-color="#94d82d"/>
        </linearGradient>
        <linearGradient id="grad-nest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#94d82d"/>
          <stop offset="15%" stop-color="#ffd43b"/>
          <stop offset="60%" stop-color="#ffa94d"/>
          <stop offset="100%" stop-color="#ff922b"/>
        </linearGradient>

        <!-- Lava Glow Gradient -->
        <linearGradient id="grad-lava" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff6b6b"/>
          <stop offset="50%" stop-color="#ffd43b"/>
          <stop offset="100%" stop-color="#ff6b6b"/>
        </linearGradient>

        <!-- River Gradient -->
        <linearGradient id="grad-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4dabf7"/>
          <stop offset="100%" stop-color="#339af0"/>
        </linearGradient>

        <!-- Summit Star Glow -->
        <radialGradient id="grad-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff9db"/>
          <stop offset="45%" stop-color="#ffd43b"/>
          <stop offset="100%" stop-color="rgba(255,212,59,0)"/>
        </radialGradient>

        <!-- Filters -->
        <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.18"/>
        </filter>
      </defs>

      <!-- ================= BIOME BACKGROUND RECTS ================= -->
      <!-- World 7: Sky (0 - 520) -->
      <rect x="0" y="0" width="${MAP_WIDTH}" height="520" fill="url(#grad-sky)"/>
      <!-- World 6: Mountain (520 - 1020) -->
      <rect x="0" y="520" width="${MAP_WIDTH}" height="500" fill="url(#grad-mountain)"/>
      <!-- World 5: Canyon (1020 - 1660) -->
      <rect x="0" y="1020" width="${MAP_WIDTH}" height="640" fill="url(#grad-canyon)"/>
      <!-- World 4: Volcano (1660 - 2660) -->
      <rect x="0" y="1660" width="${MAP_WIDTH}" height="1000" fill="url(#grad-volcano)"/>
      <!-- World 3: Jungle (2660 - 3680) -->
      <rect x="0" y="2660" width="${MAP_WIDTH}" height="1020" fill="url(#grad-jungle)"/>
      <!-- World 2: Meadow (3680 - 4560) -->
      <rect x="0" y="3680" width="${MAP_WIDTH}" height="880" fill="url(#grad-meadow)"/>
      <!-- World 1: Nest (4560 - 5400) -->
      <rect x="0" y="4560" width="${MAP_WIDTH}" height="840" fill="url(#grad-nest)"/>

      <!-- ================= SCENIC DETAILS & LANDMARKS ================= -->

      <!-- WORLD 1: NESTING GROUNDS (4560 - 5400) -->
      <!-- Warm dunes & foliage -->
      <ellipse cx="120" cy="5280" rx="180" ry="90" fill="#fcc419" opacity="0.4"/>
      <ellipse cx="640" cy="5220" rx="200" ry="110" fill="#fcc419" opacity="0.4"/>
      <path d="M-40 5380 Q 200 5280 400 5360 T 800 5320 L800 5400 L-40 5400 Z" fill="#ffa94d" opacity="0.5"/>

      <!-- Giant cozy starter nest at trailhead (x=380, y=5360) -->
      <g transform="translate(380, 5360)">
        <ellipse cx="0" cy="10" rx="110" ry="34" fill="#a65814" opacity="0.3"/>
        <path d="M-90 4 Q 0 44 90 4 Q 50 -18 -90 4 Z" fill="#d97706" stroke="#92400e" stroke-width="4"/>
        <path d="M-80 -2 Q 0 32 80 -2" stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Straw details -->
        <path d="M-85 10 L-65 -4 M-50 18 L-35 2 M20 22 L35 0 M65 14 L82 -6" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
        <!-- 3 cute speckled eggs in starter nest -->
        <ellipse cx="-34" cy="-4" rx="14" ry="19" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" transform="rotate(-14 -34 -4)"/>
        <ellipse cx="0" cy="-8" rx="15" ry="21" fill="#ecfdf5" stroke="#059669" stroke-width="2.5"/>
        <ellipse cx="36" cy="-2" rx="14" ry="18" fill="#fdf2f8" stroke="#db2777" stroke-width="2.5" transform="rotate(18 36 -2)"/>
      </g>

      <!-- Prehistoric Ferns & Flowers in Nesting area -->
      <g transform="translate(100, 5080)" opacity="0.85">
        <path d="M0 0 Q 30 -30 20 -70 Q 10 -35 0 0" fill="#2b8a3e"/>
        <path d="M-10 0 Q -40 -25 -30 -65 Q -15 -30 -10 0" fill="#2b8a3e"/>
        <path d="M-5 0 Q 0 -45 5 -80 Q -2 -40 -5 0" fill="#51cf66"/>
      </g>
      <g transform="translate(660, 4850)" opacity="0.85">
        <path d="M0 0 Q -30 -30 -20 -70 Q -10 -35 0 0" fill="#2b8a3e"/>
        <path d="M10 0 Q 40 -25 30 -65 Q 15 -30 10 0" fill="#2b8a3e"/>
        <path d="M5 0 Q 0 -45 -5 -80 Q 2 -40 5 0" fill="#51cf66"/>
      </g>

      <!-- WORLD 2: SUNNY MEADOW (3680 - 4560) -->
      <!-- Rolling meadow hills -->
      <path d="M-20 4400 Q 180 4300 420 4390 T 780 4340 L780 4500 L-20 4500 Z" fill="#69db7c" opacity="0.35"/>
      <path d="M-40 4050 Q 220 3980 500 4070 T 800 4020 L800 4200 L-40 4200 Z" fill="#51cf66" opacity="0.35"/>

      <!-- Babbling River winding through Meadow -->
      <path d="M-20 4280 Q 220 4180 380 4250 T 780 4160" fill="none" stroke="url(#grad-river)" stroke-width="42" stroke-linecap="round" opacity="0.85"/>
      <path d="M-20 4280 Q 220 4180 380 4250 T 780 4160" fill="none" stroke="#d0ebff" stroke-width="4" stroke-dasharray="24 36" opacity="0.7"/>

      <!-- Wooden plank bridge across river at (x=380, y=4250) -->
      <g transform="translate(380, 4248)">
        <rect x="-44" y="-22" width="88" height="44" rx="6" fill="#8d5b2d" stroke="#5c3818" stroke-width="3" filter="url(#soft-shadow)"/>
        <!-- Planks -->
        <line x1="-30" y1="-22" x2="-30" y2="22" stroke="#5c3818" stroke-width="2"/>
        <line x1="-15" y1="-22" x2="-15" y2="22" stroke="#5c3818" stroke-width="2"/>
        <line x1="0" y1="-22" x2="0" y2="22" stroke="#5c3818" stroke-width="2"/>
        <line x1="15" y1="-22" x2="15" y2="22" stroke="#5c3818" stroke-width="2"/>
        <line x1="30" y1="-22" x2="30" y2="22" stroke="#5c3818" stroke-width="2"/>
        <!-- Handrails -->
        <rect x="-46" y="-25" width="92" height="6" rx="2" fill="#a47141" stroke="#5c3818" stroke-width="1.5"/>
        <rect x="-46" y="19" width="92" height="6" rx="2" fill="#a47141" stroke="#5c3818" stroke-width="1.5"/>
      </g>

      <!-- Butterflies in Meadow (CSS animated fluttering) -->
      <g class="map-butterfly bf1" transform="translate(180, 4360)">
        <ellipse cx="-7" cy="-5" rx="9" ry="6" fill="#ff85a1" transform="rotate(-30 -7 -5)"/>
        <ellipse cx="7" cy="-5" rx="9" ry="6" fill="#ff85a1" transform="rotate(30 7 -5)"/>
        <ellipse cx="-5" cy="4" rx="6" ry="4" fill="#ffa8ba" transform="rotate(20 -5 4)"/>
        <ellipse cx="5" cy="4" rx="6" ry="4" fill="#ffa8ba" transform="rotate(-20 5 4)"/>
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="map-butterfly bf2" transform="translate(560, 3950)">
        <ellipse cx="-7" cy="-5" rx="9" ry="6" fill="#ffd43b" transform="rotate(-30 -7 -5)"/>
        <ellipse cx="7" cy="-5" rx="9" ry="6" fill="#ffd43b" transform="rotate(30 7 -5)"/>
        <ellipse cx="-5" cy="4" rx="6" ry="4" fill="#ffe066" transform="rotate(20 -5 4)"/>
        <ellipse cx="5" cy="4" rx="6" ry="4" fill="#ffe066" transform="rotate(-20 5 4)"/>
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- WORLD 3: TOP ROW JUNGLE (2660 - 3680) -->
      <!-- Giant jungle palm trees and monstera leaves framing the path -->
      <g transform="translate(60, 3450)" opacity="0.9">
        <path d="M0 60 Q 30 -30 90 -50" stroke="#5c3818" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M90 -50 Q 140 -80 180 -70 Q 140 -40 90 -50 Z" fill="#099268"/>
        <path d="M90 -50 Q 130 -30 160 -10 Q 120 0 90 -50 Z" fill="#087f5b"/>
        <path d="M90 -50 Q 110 -90 120 -130 Q 95 -90 90 -50 Z" fill="#20c997"/>
        <circle cx="90" cy="-45" r="7" fill="#8d5b2d"/>
        <circle cx="98" cy="-42" r="6" fill="#8d5b2d"/>
      </g>
      <g transform="translate(700, 3100)" opacity="0.9">
        <path d="M0 80 Q -40 -20 -100 -40" stroke="#5c3818" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M-100 -40 Q -150 -70 -190 -60 Q -150 -30 -100 -40 Z" fill="#099268"/>
        <path d="M-100 -40 Q -140 -20 -170 0 Q -130 10 -100 -40 Z" fill="#087f5b"/>
        <path d="M-100 -40 Q -120 -80 -130 -120 Q -105 -80 -100 -40 Z" fill="#20c997"/>
        <circle cx="-100" cy="-35" r="7" fill="#8d5b2d"/>
        <circle cx="-108" cy="-32" r="6" fill="#8d5b2d"/>
      </g>

      <!-- Hanging tropical vines -->
      <path d="M0 2900 Q 140 2970 280 2920" stroke="#2b8a3e" stroke-width="4" fill="none" opacity="0.7"/>
      <path d="M480 2820 Q 620 2890 760 2830" stroke="#2b8a3e" stroke-width="4" fill="none" opacity="0.7"/>

      <!-- WORLD 4: LAVA VOLCANO (1660 - 2660) -->
      <!-- Basalt cliffs & smoking volcano -->
      <path d="M-20 2200 L 120 2050 L 260 2250 L 400 2100 L 580 2280 L 780 2120 L 780 2400 L -20 2400 Z" fill="#1f2429" opacity="0.8"/>

      <!-- The Big Volcano at (x=600, y=1980) -->
      <g transform="translate(600, 1980)">
        <polygon points="-160,240 160,240 60,0 -60,0" fill="#212529" stroke="#111" stroke-width="3"/>
        <polygon points="-60,0 60,0 45,25 -45,25" fill="#c92a2a"/>
        <ellipse cx="0" cy="10" rx="42" ry="12" fill="#ff6b6b"/>
        <ellipse cx="0" cy="10" rx="28" ry="7" fill="#ffd43b" filter="url(#map-glow)"/>

        <!-- Animated rising smoke puffs -->
        <g class="volcano-smoke-group">
          <circle class="map-smoke s1" cx="-12" cy="-24" r="14" fill="#dee2e6" opacity="0.6"/>
          <circle class="map-smoke s2" cx="16" cy="-45" r="20" fill="#ced4da" opacity="0.5"/>
          <circle class="map-smoke s3" cx="-6" cy="-75" r="26" fill="#adb5bd" opacity="0.4"/>
          <circle class="map-smoke s4" cx="12" cy="-110" r="32" fill="#868e96" opacity="0.3"/>
        </g>

        <!-- Flowing Lava Rivers -->
        <path d="M-15 20 Q -45 100 -20 180 Q 10 210 -10 240" stroke="url(#grad-lava)" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#map-glow)"/>
        <path d="M25 20 Q 55 90 40 160 Q 20 200 50 240" stroke="url(#grad-lava)" stroke-width="8" fill="none" stroke-linecap="round" filter="url(#map-glow)"/>
      </g>

      <!-- Molten lava river crossing canyon floor -->
      <path d="M-40 2480 Q 220 2560 420 2480 T 800 2520" stroke="url(#grad-lava)" stroke-width="22" fill="none" opacity="0.75" filter="url(#map-glow)"/>

      <!-- WORLD 5: ECHO CANYON (1020 - 1660) -->
      <!-- Red Rock Mesas & Arches -->
      <path d="M-20 1480 Q 150 1420 320 1460 L 320 1600 L -20 1600 Z" fill="#d9480f" opacity="0.6"/>
      <path d="M460 1400 Q 620 1350 780 1410 L 780 1560 L 460 1560 Z" fill="#e8590c" opacity="0.6"/>

      <!-- Prehistoric Canyon Rock Arch at (x=160, y=1250) -->
      <g transform="translate(160, 1250)">
        <path d="M-60 90 L -50 0 Q 0 -60 50 0 L 60 90 Q 25 30 0 25 Q -25 30 -60 90 Z" fill="#f76707" stroke="#d9480f" stroke-width="3"/>
      </g>

      <!-- Prehistoric Fossil embedded in canyon wall (x=620, y=1220) -->
      <g transform="translate(620, 1220)" opacity="0.6">
        <circle cx="0" cy="0" r="28" fill="#ffd8a8" stroke="#d9480f" stroke-width="2"/>
        <!-- Spiral Ammonite shell -->
        <path d="M0 0 A 6 6 0 0 1 6 0 A 12 12 0 0 1 -12 0 A 18 18 0 0 1 18 0 A 24 24 0 0 1 -24 0" fill="none" stroke="#d9480f" stroke-width="3" stroke-linecap="round"/>
      </g>

      <!-- Desert Cacti -->
      <g transform="translate(680, 1420)" opacity="0.8">
        <rect x="-6" y="-45" width="12" height="50" rx="6" fill="#2f9e44"/>
        <path d="M-6 -25 L -20 -25 L -20 -40" stroke="#2f9e44" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 -15 L 20 -15 L 20 -30" stroke="#2f9e44" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <!-- WORLD 6: CRYSTAL MOUNTAIN (520 - 1020) -->
      <!-- Snowy mountain silhouettes -->
      <polygon points="40,880 180,620 320,880" fill="#339af0" opacity="0.7"/>
      <polygon points="120,730 180,620 240,730 210,710 180,730 150,710" fill="#ffffff"/>

      <polygon points="420,850 580,560 740,850" fill="#228be6" opacity="0.75"/>
      <polygon points="510,680 580,560 650,680 620,660 580,680 540,660" fill="#ffffff"/>

      <!-- Sparkling crystal clusters (x=160, y=820) and (x=600, y=780) -->
      <g class="map-crystal c1" transform="translate(170, 830)">
        <polygon points="0,-35 10,-10 0,15 -10,-10" fill="#d0bfff" stroke="#9775fa" stroke-width="1.5"/>
        <polygon points="12,-25 20,-5 12,12 5,-5" fill="#e5dbff" stroke="#9775fa" stroke-width="1.5"/>
        <polygon points="-12,-20 -5,-2 -12,14 -18,-2" fill="#b197fc" stroke="#9775fa" stroke-width="1.5"/>
      </g>
      <g class="map-crystal c2" transform="translate(610, 760)">
        <polygon points="0,-40 12,-12 0,18 -12,-12" fill="#a5d8ff" stroke="#339af0" stroke-width="1.5"/>
        <polygon points="14,-28 22,-6 14,15 6,-6" fill="#d0ebff" stroke="#339af0" stroke-width="1.5"/>
        <polygon points="-14,-24 -6,-4 -14,14 -20,-4" fill="#74c0fc" stroke="#339af0" stroke-width="1.5"/>
      </g>

      <!-- WORLD 7: CLOUD PEAK / SKY KINGDOM (0 - 520) -->
      <!-- Floating Cloud Islands -->
      <g class="map-cloud mc1" transform="translate(140, 360)">
        <ellipse cx="0" cy="0" rx="90" ry="28" fill="#ffffff" opacity="0.92" filter="url(#soft-shadow)"/>
        <circle cx="-35" cy="-14" r="30" fill="#ffffff" opacity="0.95"/>
        <circle cx="20" cy="-16" r="38" fill="#ffffff" opacity="0.95"/>
      </g>
      <g class="map-cloud mc2" transform="translate(620, 260)">
        <ellipse cx="0" cy="0" rx="100" ry="32" fill="#ffffff" opacity="0.92" filter="url(#soft-shadow)"/>
        <circle cx="-40" cy="-16" r="34" fill="#ffffff" opacity="0.95"/>
        <circle cx="25" cy="-18" r="42" fill="#ffffff" opacity="0.95"/>
      </g>
      <g class="map-cloud mc3" transform="translate(220, 140)">
        <ellipse cx="0" cy="0" rx="80" ry="26" fill="#ffffff" opacity="0.95" filter="url(#soft-shadow)"/>
        <circle cx="-25" cy="-12" r="28" fill="#ffffff" opacity="0.98"/>
        <circle cx="20" cy="-14" r="32" fill="#ffffff" opacity="0.98"/>
      </g>

      <!-- Magnificent Rainbow bridging across the summit sky -->
      <g transform="translate(380, 220)" opacity="0.65">
        <path d="M -300 120 A 320 220 0 0 1 300 120" stroke="#ff8787" stroke-width="10" fill="none"/>
        <path d="M -290 120 A 310 210 0 0 1 290 120" stroke="#ffd43b" stroke-width="10" fill="none"/>
        <path d="M -280 120 A 300 200 0 0 1 280 120" stroke="#69db7c" stroke-width="10" fill="none"/>
        <path d="M -270 120 A 290 190 0 0 1 270 120" stroke="#4dabf7" stroke-width="10" fill="none"/>
        <path d="M -260 120 A 280 180 0 0 1 260 120" stroke="#b197fc" stroke-width="10" fill="none"/>
      </g>

      <!-- SUMMIT STAR SANCTUARY (x=380, y=50) -->
      <g transform="translate(380, 50)">
        <!-- Golden radiant halo -->
        <circle cx="0" cy="0" r="70" fill="url(#grad-star)"/>
        <circle cx="0" cy="0" r="40" fill="#ffd43b" opacity="0.3"/>
        <!-- Giant Golden 5-point Star -->
        <polygon points="0,-32 10,-10 33,-8 16,9 21,31 0,18 -21,31 -16,9 -33,-8 -10,-10"
          fill="#ffd43b" stroke="#f59f00" stroke-width="3" filter="url(#soft-shadow)"/>
        <polygon points="0,-24 7,-8 24,-6 12,6 16,22 0,13 -16,22 -12,6 -24,-6 -7,-8" fill="#fff9db"/>
      </g>

      <!-- ================= THE TRAIL PATH ================= -->
      <!-- Path Layer 1: Soft Outer Shadow -->
      <path d="${fullPathD}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="54" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Path Layer 2: Trail Stone Bed Base -->
      <path d="${fullPathD}" fill="none" stroke="#fff9db" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Path Layer 3: Cobblestone Edge Trim -->
      <path d="${fullPathD}" fill="none" stroke="#e9ecef" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Path Layer 4: Stepping Stones / Cobbles (Unfinished path guide) -->
      <path d="${fullPathD}" fill="none" stroke="#ced4da" stroke-width="10" stroke-dasharray="14 18" stroke-linecap="round"/>

      <!-- Path Layer 5: UNLOCKED & COMPLETED ADVENTURE TRAIL -->
      <!-- Glowing green path that lights up as the player progresses -->
      <path class="map-unlocked-trail" d="${unlockedPathD}" fill="none" stroke="#51cf66" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
      <!-- Animated glowing footsteps/dots travelling forward -->
      <path class="map-footsteps" d="${unlockedPathD}" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="10 20" stroke-linecap="round"/>

    </svg>
  `;
}

/**
 * WorldMap interactive view class.
 * Renders the SVG canvas, stepping stone buttons, avatar token, quick-jump nav,
 * and level preview card modal into the container.
 */
export class WorldMap {
  constructor({ container, store, onSelectLevel }) {
    this.container = container;
    this.store = store;
    this.onSelectLevel = onSelectLevel;

    this.levelPoints = computeMapCoordinates(WORLDS);
    this.selectedLevel = null;

    this.onKeydown = this.onKeydown.bind(this);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeydown);
  }

  onKeydown(e) {
    if (e.key === 'Escape') {
      this.closeModal();
    }
  }

  render() {
    window.addEventListener('keydown', this.onKeydown);

    const p = this.store.current;
    if (!p) return;

    const opts = { startWorld: p.startWorld, unlockAll: p.settings.unlockAll };
    const curLvl = currentLevel(p.levels, opts) || this.levelPoints[0].level;
    const curPoint = this.levelPoints.find((lp) => lp.id === curLvl.id) || this.levelPoints[0];
    const curGlobalIdx = curPoint.globalIndex;

    this.container.innerHTML = '';

    // Wrapper element
    const wrap = document.createElement('div');
    wrap.className = 'map-view-root';

    // 1. Floating Quick-Jump World Navigation Bar
    const navBar = document.createElement('nav');
    navBar.className = 'map-world-nav';
    navBar.setAttribute('aria-label', 'Biomes quick jump');

    BIOMES.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-nav-pill';
      btn.innerHTML = `<span class="map-nav-icon">${b.icon}</span><span class="map-nav-name">${b.title}</span>`;
      btn.title = `Jump to ${b.title} (${b.ages})`;
      btn.addEventListener('click', () => {
        sfx.click();
        this.scrollToWorld(b.id);
      });
      navBar.appendChild(btn);
    });
    wrap.appendChild(navBar);

    // 2. Map Canvas Container
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'map-canvas-wrap';

    // 2a. Inject SVG Background
    canvasWrap.innerHTML = generateMapSVG(this.levelPoints, curGlobalIdx);

    // 2b. Biome Landmark Banners Layer
    const bannersLayer = document.createElement('div');
    bannersLayer.className = 'map-landmarks-layer';

    BIOMES.forEach((b) => {
      const banner = document.createElement('div');
      banner.className = `map-biome-banner banner-${b.id}`;
      banner.id = `map-banner-${b.id}`;
      // Position vertically as percentage of 5400
      const topPct = (b.bannerY / MAP_HEIGHT) * 100;
      banner.style.top = `${topPct}%`;

      const world = WORLDS.find((w) => w.id === b.id);
      let earnedStars = 0;
      let totalWorldStars = 0;
      if (world) {
        totalWorldStars = world.levels.length * 3;
        world.levels.forEach((lvl) => {
          earnedStars += p.levels[lvl.id]?.stars || 0;
        });
      }

      banner.innerHTML = `
        <div class="map-banner-chip">
          <span class="map-banner-icon">${b.icon}</span>
          <div class="map-banner-text">
            <div class="map-banner-title">World ${b.worldIndex + 1}: ${b.title}</div>
            <div class="map-banner-sub">${b.ages} · ${b.blurb}</div>
          </div>
          <div class="map-banner-stars">⭐ ${earnedStars}/${totalWorldStars}</div>
        </div>
      `;
      bannersLayer.appendChild(banner);
    });
    canvasWrap.appendChild(bannersLayer);

    // 2c. Background Playing Dinosaurs Layer
    const bgDinosLayer = document.createElement('div');
    bgDinosLayer.className = 'map-bg-dinos-layer';
    bgDinosLayer.setAttribute('aria-label', 'Friendly dinosaurs playing in the biomes');

    BACKGROUND_DINOS.forEach((d) => {
      const dinoEl = document.createElement('div');
      dinoEl.className = `map-bg-dino dino-${d.id} action-${d.action}`;
      dinoEl.dataset.bgDinoId = d.id;
      dinoEl.setAttribute('role', 'button');
      dinoEl.setAttribute('tabindex', '0');
      dinoEl.setAttribute('aria-label', `${d.name} playing in ${d.biome}: ${d.speech}`);

      const leftPct = (d.x / MAP_WIDTH) * 100;
      const topPct = (d.y / MAP_HEIGHT) * 100;
      dinoEl.style.left = `${leftPct}%`;
      dinoEl.style.top = `${topPct}%`;

      const propHtml = renderBgDinoProp(d.prop);
      const dinoArtHtml = dinoSVG(d.dinoId);

      dinoEl.innerHTML = `
        <div class="bg-dino-speech" id="speech-${d.id}">
          <span class="speech-text">${d.speech}</span>
        </div>
        <div class="bg-dino-body ${d.facing}">
          ${dinoArtHtml}
          ${propHtml}
        </div>
        <div class="bg-dino-name">
          <span>${d.name}</span>
        </div>
      `;

      const triggerInteraction = (e) => {
        e.stopPropagation();
        sfx.correct();
        dinoEl.classList.remove('active-celebrate');
        void dinoEl.offsetWidth;
        dinoEl.classList.add('active-celebrate');

        const speechEl = dinoEl.querySelector('.bg-dino-speech');
        if (speechEl) {
          speechEl.classList.add('visible');
          clearTimeout(dinoEl._speechTimer);
          dinoEl._speechTimer = setTimeout(() => {
            speechEl.classList.remove('visible');
          }, 3400);
        }
        say(`${d.name} says: ${d.speech}`);
      };

      dinoEl.addEventListener('click', triggerInteraction);
      dinoEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerInteraction(e);
        }
      });

      bgDinosLayer.appendChild(dinoEl);
    });
    canvasWrap.appendChild(bgDinosLayer);

    // 2d. Interactive Stepping Stone Nodes Layer
    const nodesLayer = document.createElement('div');
    nodesLayer.className = 'map-nodes-layer';

    this.levelPoints.forEach((pt) => {
      const lvl = pt.level;
      const unlocked = isUnlocked(lvl.id, p.levels, opts);
      const isCurrent = curLvl && curLvl.id === lvl.id;
      const record = p.levels[lvl.id];
      const starsEarned = record?.stars || 0;

      const nodeBtn = document.createElement('button');
      nodeBtn.type = 'button';
      nodeBtn.className = `map-node ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${starsEarned > 0 ? 'completed' : ''}`;
      nodeBtn.dataset.levelId = lvl.id;
      nodeBtn.setAttribute('aria-label', `${lvl.title}, Level ${lvl.indexInWorld + 1} of ${pt.world.name}`);

      // Percentage coordinate placement
      const leftPct = (pt.x / MAP_WIDTH) * 100;
      const topPct = (pt.y / MAP_HEIGHT) * 100;
      nodeBtn.style.left = `${leftPct}%`;
      nodeBtn.style.top = `${topPct}%`;

      // Reward badge
      let rewardBadgeHtml = '';
      if (lvl.reward) {
        const dinoReward = getDino(lvl.reward);
        if (starsEarned > 0) {
          rewardBadgeHtml = `<div class="map-node-reward unlocked" title="Dino friend unlocked: ${dinoReward.name}!">🦕</div>`;
        } else {
          rewardBadgeHtml = `<div class="map-node-reward locked" title="Reward: Hatch ${dinoReward.name}!">🥚</div>`;
        }
      }

      // Star badges (3 slots)
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span class="star-pip ${s <= starsEarned ? 'earned' : 'empty'}">★</span>`;
      }

      nodeBtn.innerHTML = `
        ${rewardBadgeHtml}
        <div class="map-node-inner">
          <span class="map-node-num">${lvl.indexInWorld + 1}</span>
        </div>
        <div class="map-node-stars">${starsHtml}</div>
        ${isCurrent ? '<div class="map-node-pulse"></div>' : ''}
      `;

      nodeBtn.addEventListener('click', () => {
        if (!unlocked) {
          sfx.wrong();
          // Shake animation
          nodeBtn.classList.remove('shake');
          void nodeBtn.offsetWidth; // trigger reflow
          nodeBtn.classList.add('shake');
          this.showToast('🔒 Complete earlier levels to unlock this spot!');
          return;
        }

        sfx.click();
        this.openLevelModal(lvl, unlocked, starsEarned, isCurrent, pt);
      });

      nodesLayer.appendChild(nodeBtn);
    });
    canvasWrap.appendChild(nodesLayer);

    // 2d. Player Dinosaur Avatar Token
    const avatarEl = document.createElement('div');
    avatarEl.className = 'map-player-avatar';
    avatarEl.id = 'map-player-avatar';
    const curLeftPct = (curPoint.x / MAP_WIDTH) * 100;
    const curTopPct = (curPoint.y / MAP_HEIGHT) * 100;
    avatarEl.style.left = `${curLeftPct}%`;
    avatarEl.style.top = `${curTopPct}%`;

    const buddy = getDino(p.buddy);
    avatarEl.innerHTML = `
      <div class="map-avatar-shadow"></div>
      <div class="map-avatar-dino" title="Your dino buddy: ${buddy.name}">
        ${dinoSVG(buddy)}
      </div>
      <div class="map-avatar-tag">
        <span>${p.name}</span>
      </div>
    `;

    // Cheerful hop & chirp when tapped
    avatarEl.addEventListener('click', () => {
      sfx.correct();
      avatarEl.classList.remove('jump');
      void avatarEl.offsetWidth;
      avatarEl.classList.add('jump');
      say(`${buddy.name} says let's go, ${p.name}!`);
    });

    canvasWrap.appendChild(avatarEl);

    wrap.appendChild(canvasWrap);

    // 3. Floating "📍 My Dino" Jump Button
    let focusBtn = document.getElementById('map-focus-btn');
    if (!focusBtn) {
      focusBtn = document.createElement('button');
      focusBtn.type = 'button';
      focusBtn.className = 'map-focus-btn';
      focusBtn.id = 'map-focus-btn';
      focusBtn.innerHTML = `<span>🦖</span><span>My Dino</span>`;
      focusBtn.title = 'Scroll to your dino buddy';
      const screenMap = document.getElementById('screen-map');
      if (screenMap) {
        screenMap.appendChild(focusBtn);
      } else {
        wrap.appendChild(focusBtn);
      }
    }
    focusBtn.onclick = () => {
      sfx.click();
      this.scrollToCurrentLevel(true);
    };

    // 4. Level Preview Modal Container
    let modal = document.getElementById('map-level-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'map-level-modal';
      modal.id = 'map-level-modal';
      modal.innerHTML = `
        <div class="map-modal-backdrop" id="map-modal-backdrop"></div>
        <div class="map-modal-card" id="map-modal-card" role="dialog" aria-modal="true"></div>
      `;
      const screenMap = document.getElementById('screen-map');
      if (screenMap) {
        screenMap.appendChild(modal);
      } else {
        wrap.appendChild(modal);
      }
    }

    this.container.appendChild(wrap);

    // Automatically center viewport on player's current level
    setTimeout(() => {
      this.scrollToCurrentLevel(false);
    }, 60);
  }

  /**
   * Opens the rich Level Preview Card modal before starting gameplay.
   */
  openLevelModal(lvl, unlocked, starsEarned, isCurrent, pt) {
    this.selectedLevel = lvl;
    const p = this.store.current;
    const modalEl = document.getElementById('map-level-modal');
    const cardEl = document.getElementById('map-modal-card');
    const backdropEl = document.getElementById('map-modal-backdrop');
    if (!modalEl || !cardEl) return;

    const modeLabels = {
      hatch: { title: '🥚 Egg Hatch', desc: 'Find the glowing key to help the baby dino crack open its egg!' },
      trail: { title: '🦕 Stomp Trail', desc: 'Keep up your rhythm and romp along the trail with your dino friend!' },
      meteor: { title: '☄️ Meteor Dodge', desc: 'Type the falling meteors before they hit the ground!' },
      race: { title: '🏁 Dino Derby', desc: 'Touch-type with all fingers to race Zip the pterodactyl to the finish line!' },
    };
    const modeInfo = modeLabels[lvl.mode] || { title: lvl.mode, desc: 'Type each letter to advance!' };

    // Keys badge tags
    let keysHtml = '';
    if (lvl.newKeys && lvl.newKeys.length > 0) {
      keysHtml = lvl.newKeys.map((k) => `<kbd class="map-key-chip">${k === ' ' ? 'Space' : k.toUpperCase()}</kbd>`).join(' ');
    } else {
      keysHtml = '<span class="map-key-rev">Review & Practice</span>';
    }

    // Dino Reward Box
    let rewardBoxHtml = '';
    if (lvl.reward) {
      const dinoReward = getDino(lvl.reward);
      const isAlreadyUnlocked = starsEarned > 0;
      rewardBoxHtml = `
        <div class="map-reward-box ${isAlreadyUnlocked ? 'earned' : 'locked'}">
          <div class="map-reward-art">${dinoSVG(dinoReward)}</div>
          <div class="map-reward-info">
            <div class="map-reward-tag">${isAlreadyUnlocked ? '⭐ Dino Unlocked!' : '🎁 Dino Reward!'}</div>
            <div class="map-reward-name">${dinoReward.name} the ${SPECIES_NAMES[dinoReward.species] || 'Dino'}</div>
            <div class="map-reward-sub">${isAlreadyUnlocked ? 'In your dino collection!' : 'Complete this level with 1+ star to unlock!'}</div>
          </div>
        </div>
      `;
    }

    // Personal best stars & stats
    const record = p.levels[lvl.id];
    let recordStatsHtml = '';
    if (record && record.stars > 0) {
      recordStatsHtml = `
        <div class="map-record-stats">
          <div class="stat-item"><span class="stat-label">Best Stars:</span> <span class="stat-val">⭐ ${record.stars}/3</span></div>
          ${record.bestWpm ? `<div class="stat-item"><span class="stat-label">Best Speed:</span> <span class="stat-val">${record.bestWpm} WPM</span></div>` : ''}
          ${record.bestAcc ? `<div class="stat-item"><span class="stat-label">Accuracy:</span> <span class="stat-val">${record.bestAcc}%</span></div>` : ''}
        </div>
      `;
    }

    cardEl.innerHTML = `
      <button class="map-modal-close" id="btn-modal-close" aria-label="Close dialog">✕</button>
      <div class="map-modal-header" style="background: var(--theme-color, ${pt.biome.accent});">
        <span class="map-modal-biome-icon">${pt.biome.icon}</span>
        <div class="map-modal-header-titles">
          <div class="map-modal-world-name">${pt.world.name}</div>
          <h3 class="map-modal-level-title">Level ${lvl.indexInWorld + 1}: ${lvl.title}</h3>
        </div>
      </div>
      <div class="map-modal-body">
        <div class="map-modal-mode-badge">${modeInfo.title}</div>
        <p class="map-modal-desc">${lvl.intro || modeInfo.desc}</p>
        <div class="map-modal-keys">
          <span class="map-keys-label">Keys:</span>
          <div class="map-keys-chips">${keysHtml}</div>
        </div>
        ${rewardBoxHtml}
        ${recordStatsHtml}
        <div class="map-modal-actions">
          <button class="btn big primary map-play-btn" id="btn-modal-play">▶ Play Level!</button>
        </div>
      </div>
    `;

    modalEl.classList.add('open');

    // Bind modal actions
    const closeBtn = cardEl.querySelector('#btn-modal-close');
    const playBtn = cardEl.querySelector('#btn-modal-play');

    closeBtn?.addEventListener('click', () => {
      sfx.click();
      this.closeModal();
    });

    backdropEl?.addEventListener('click', () => {
      this.closeModal();
    });

    playBtn?.addEventListener('click', () => {
      sfx.click();
      this.closeModal();
      if (this.onSelectLevel) {
        this.onSelectLevel(lvl.id);
      }
    });

    setTimeout(() => playBtn?.focus(), 50);
  }

  closeModal() {
    const modalEl = document.getElementById('map-level-modal');
    if (modalEl) modalEl.classList.remove('open');
    this.selectedLevel = null;
  }

  /**
   * Scrolls the map view vertically to center on the player's active avatar.
   * Strictly avoids horizontal scrolling or triggering browser inline shift bugs.
   */
  scrollToCurrentLevel(smooth = true) {
    const avatar = document.getElementById('map-player-avatar');
    const scrollContainer = this.container;
    if (!avatar || !scrollContainer) return;

    const avatarRect = avatar.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const currentScrollTop = scrollContainer.scrollTop;
    const targetScrollTop = Math.max(0, currentScrollTop + (avatarRect.top - containerRect.top) - (containerRect.height / 2) + (avatarRect.height / 2));

    if (!smooth) {
      scrollContainer.style.scrollBehavior = 'auto';
      scrollContainer.scrollTop = targetScrollTop;
      scrollContainer.scrollLeft = 0;
      setTimeout(() => {
        if (scrollContainer) scrollContainer.style.scrollBehavior = '';
      }, 50);
    } else {
      scrollContainer.scrollTo({
        top: targetScrollTop,
        left: 0,
        behavior: 'smooth',
      });
      scrollContainer.scrollLeft = 0;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  /**
   * Scrolls vertically to a specific world's gateway banner.
   */
  scrollToWorld(worldId, smooth = true) {
    const banner = document.getElementById(`map-banner-${worldId}`);
    const scrollContainer = this.container;
    if (!banner || !scrollContainer) return;

    const navBar = scrollContainer.querySelector('.map-world-nav');
    const navHeight = navBar ? navBar.offsetHeight : 60;

    const bannerRect = banner.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const currentScrollTop = scrollContainer.scrollTop;
    const targetScrollTop = Math.max(0, currentScrollTop + (bannerRect.top - containerRect.top) - navHeight - 12);

    if (!smooth) {
      scrollContainer.scrollTop = targetScrollTop;
      scrollContainer.scrollLeft = 0;
    } else {
      scrollContainer.scrollTo({
        top: targetScrollTop,
        left: 0,
        behavior: 'smooth',
      });
      scrollContainer.scrollLeft = 0;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }
}
