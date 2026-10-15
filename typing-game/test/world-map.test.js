import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS } from '../js/curriculum.js';
import {
  BIOMES,
  MAP_WIDTH,
  MAP_HEIGHT,
  computeMapCoordinates,
  pointsToPath,
  generateMapSVG,
} from '../js/world-map.js';

test('BIOMES defines all 7 worlds with valid ranges and themes', () => {
  assert.equal(BIOMES.length, 7);
  const biomeIds = BIOMES.map((b) => b.id);
  const worldIds = WORLDS.map((w) => w.id);
  assert.deepEqual(biomeIds, worldIds);

  BIOMES.forEach((b) => {
    assert.ok(b.title, `Biome ${b.id} missing title`);
    assert.ok(b.icon, `Biome ${b.id} missing icon`);
    assert.ok(b.accent, `Biome ${b.id} missing accent color`);
    assert.ok(b.yStart > 0 && b.yStart <= MAP_HEIGHT, `Invalid yStart for ${b.id}`);
    assert.ok(b.yEnd >= 0 && b.yEnd <= MAP_HEIGHT, `Invalid yEnd for ${b.id}`);
    assert.ok(b.bannerY >= 0 && b.bannerY <= MAP_HEIGHT, `Invalid bannerY for ${b.id}`);
  });
});

test('computeMapCoordinates places all 47 levels with valid bounds and spacing', () => {
  const points = computeMapCoordinates(WORLDS);
  assert.equal(points.length, 47);

  points.forEach((pt, i) => {
    assert.ok(pt.id, `Point ${i} has no id`);
    assert.ok(pt.level, `Point ${i} has no level`);
    assert.ok(pt.world, `Point ${i} has no world`);
    assert.ok(pt.biome, `Point ${i} has no biome`);

    // X coordinates should stay inside the visible 760px canvas with comfortable margins
    assert.ok(pt.x >= 120 && pt.x <= 640, `Point ${pt.id} x=${pt.x} out of bounds`);

    // Y coordinates should span from bottom (~5200) to top (~100)
    assert.ok(pt.y >= 50 && pt.y <= 5300, `Point ${pt.id} y=${pt.y} out of bounds`);
  });

  // Check that consecutive levels have adequate spacing so nodes do not overlap
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    assert.ok(
      dist >= 70,
      `Consecutive levels ${prev.id} and ${curr.id} are too close: ${dist.toFixed(1)}px`
    );
  }
});

test('pointsToPath creates valid SVG cubic bezier syntax', () => {
  assert.equal(pointsToPath([]), '');
  assert.equal(pointsToPath([{ x: 100, y: 200 }]), 'M 100 200');

  const pts = [
    { x: 380, y: 5200 },
    { x: 500, y: 5000 },
    { x: 260, y: 4800 },
  ];
  const d = pointsToPath(pts);
  assert.ok(d.startsWith('M 380 5200'), 'Should start with M');
  assert.ok(d.includes('C'), 'Should include cubic bezier C commands');
  const curveCount = (d.match(/C/g) || []).length;
  assert.equal(curveCount, 2, 'Should have 2 cubic segments for 3 points');
});

test('generateMapSVG outputs complete SVG structure with landmarks and trail', () => {
  const points = computeMapCoordinates(WORLDS);
  const svg = generateMapSVG(points, 5);

  assert.ok(svg.includes(`<svg class="map-svg-canvas"`), 'Contains svg root');
  assert.ok(svg.includes(`viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}"`), 'Correct viewBox');

  // Verify all 7 biome gradient definitions
  ['grad-sky', 'grad-mountain', 'grad-canyon', 'grad-volcano', 'grad-jungle', 'grad-meadow', 'grad-nest'].forEach((g) => {
    assert.ok(svg.includes(`id="${g}"`), `Missing gradient ${g}`);
  });

  // Verify landmark elements
  assert.ok(svg.includes('volcano-smoke'), 'Contains animated volcano smoke');
  assert.ok(svg.includes('map-butterfly'), 'Contains meadow butterflies');
  assert.ok(svg.includes('map-crystal'), 'Contains mountain crystals');
  assert.ok(svg.includes('map-cloud'), 'Contains sky clouds');
  assert.ok(svg.includes('map-footsteps'), 'Contains animated footsteps');
  assert.ok(svg.includes('map-unlocked-trail'), 'Contains unlocked adventure trail');
});

test('BACKGROUND_DINOS defines 12 friendly playing dinos with valid clearances', async () => {
  const { BACKGROUND_DINOS, renderBgDinoProp } = await import('../js/world-map.js');
  const { computeMapCoordinates } = await import('../js/world-map.js');
  const levelPts = computeMapCoordinates(WORLDS);

  assert.equal(BACKGROUND_DINOS.length, 12, 'Should define 12 background playing dinos');

  BACKGROUND_DINOS.forEach((d) => {
    assert.ok(d.id, 'Dino missing id');
    assert.ok(d.dinoId, 'Dino missing dinoId');
    assert.ok(d.name, 'Dino missing name');
    assert.ok(d.biome, 'Dino missing biome');
    assert.ok(d.action, 'Dino missing action');
    assert.ok(d.speech, 'Dino missing speech quote');
    assert.ok(d.x >= 60 && d.x <= 700, `Dino ${d.id} x=${d.x} out of canvas bounds`);
    assert.ok(d.y >= 50 && d.y <= 5350, `Dino ${d.id} y=${d.y} out of canvas bounds`);

    if (d.prop) {
      const propSvg = renderBgDinoProp(d.prop);
      assert.ok(propSvg.length > 0, `Prop ${d.prop} rendered empty string`);
    }
  });

  // Verify that all 12 dinos have at least 70px clearance from every level node
  BACKGROUND_DINOS.forEach((d) => {
    levelPts.forEach((pt) => {
      const dist = Math.hypot(d.x - pt.x, d.y - pt.y);
      assert.ok(
        dist >= 70,
        `Dino ${d.id} is too close to level ${pt.id} (${dist.toFixed(1)}px < 70px)`
      );
    });
  });
});

test('mobile world map prevents horizontal scrolling and overflow', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const css = fs.readFileSync(path.join(dir, '..', 'css', 'style.css'), 'utf8');
  const html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8');

  // #screen-map has overflow: hidden and max-width: 100vw
  assert.ok(css.includes('#screen-map {'), 'style.css defines #screen-map');
  assert.ok(css.includes('max-width: 100vw;'), 'style.css bounds screen-map to 100vw');

  // .map-scroll has touch-action: pan-y and overflow-x: hidden
  assert.ok(css.includes('touch-action: pan-y;'), 'style.css sets touch-action: pan-y on map-scroll');
  assert.ok(css.includes('overscroll-behavior-x: none;'), 'style.css disables horizontal overscroll');

  // .map-canvas-wrap has aspect-ratio: 760 / 5400
  assert.ok(css.includes('aspect-ratio: 760 / 5400;'), 'map-canvas-wrap defines aspect-ratio');

  // Responsive topbar styling exists
  assert.ok(css.includes('@media (max-width: 768px)'), 'style.css defines mobile topbar media query');

  // HTML index.html contains direct map-focus-btn and map-level-modal
  assert.ok(html.includes('id="map-focus-btn"'), 'index.html defines #map-focus-btn');
  assert.ok(html.includes('id="map-level-modal"'), 'index.html defines #map-level-modal');
});

