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

export const THEMES = {
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
export function renderScene(host, theme = 'meadow', { drift = false } = {}) {
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
export function renderStaticScenes(root = document) {
  root.querySelectorAll('.scene-host[data-theme]').forEach((h) => {
    if (!h.firstElementChild) renderScene(h, h.dataset.theme, { drift: true });
  });
}
