// Hand-built SVG art: cute side-view dinos (one parametric body, species-specific
// features) and hatching eggs. Animation is done in CSS via the class names here.
import { getDino } from './dinos.js';

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour. */
export function shade(hex, amt) {
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
export function dinoSVG(dinoOrId, { className = '' } = {}) {
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
export function eggSVG({ color = '#fff6e0', spot = '#9fd8a8' } = {}) {
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
export function nestSVG() {
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
export function meteorSVG() {
  return `<svg class="meteor-art" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="mtail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe066" stop-opacity="0"/><stop offset="1" stop-color="#ff922b" stop-opacity=".9"/>
    </linearGradient></defs>
    <path d="M38 0 L82 0 L96 100 L24 100 Z" fill="url(#mtail)"/>
    <circle cx="60" cy="110" r="44" fill="#8d6e63"/>
    <circle cx="44" cy="96" r="9" fill="#6d4c41"/><circle cx="78" cy="124" r="7" fill="#6d4c41"/><circle cx="80" cy="94" r="5" fill="#6d4c41"/>
  </svg>`;
}
