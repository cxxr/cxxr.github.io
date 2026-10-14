import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS, LEVELS, poolFor, isUnlocked, currentLevel, starsFor, nextLevel, getLevel } from '../js/curriculum.js';
import { buildContent, canType, mulberry32 } from '../js/textgen.js';
import { keyFor, fingerHint, spokenName } from '../js/layout.js';
import { DINOS } from '../js/dinos.js';

test('level ids are unique and every level has a known mode', () => {
  const ids = new Set();
  for (const l of LEVELS) {
    assert.ok(!ids.has(l.id), `duplicate ${l.id}`);
    ids.add(l.id);
    assert.ok(['hatch', 'trail', 'meteor', 'race'].includes(l.mode), l.id);
  }
  assert.equal(LEVELS.length, WORLDS.reduce((n, w) => n + w.levels.length, 0));
});

test('every new key is typeable on the layout', () => {
  for (const l of LEVELS) {
    for (const k of l.newKeys) {
      if (k === 'Shift') continue;
      assert.ok(keyFor(k), `${l.id}: no key for ${JSON.stringify(k)}`);
    }
  }
});

test('key pools grow monotonically (except at a resetPool world)', () => {
  let prev = 0;
  for (const l of LEVELS) {
    const size = poolFor(l.id).filter((k) => k !== ' ').length;
    const reset = l.indexInWorld === 0 && WORLDS[l.worldIndex].resetPool;
    assert.ok(reset || size >= prev, `${l.id} pool shrank`);
    prev = size;
  }
  assert.deepEqual(poolFor('meadow-1').sort(), [' ', 'f', 'j']);
});

test('every level generates content using only known keys', () => {
  for (const l of LEVELS) {
    const pool = poolFor(l.id);
    const set = new Set([...pool, ' ']);
    for (let seed = 1; seed <= 5; seed++) {
      const content = buildContent(l, pool, { rng: mulberry32(seed) });
      const items = Array.isArray(content) ? content : [content];
      assert.ok(items.length > 0, l.id);
      for (const item of items) {
        assert.ok(item.length > 0, `${l.id} produced empty item`);
        assert.ok(canType(item, set), `${l.id} (seed ${seed}) produced untypeable "${item}"`);
      }
    }
  }
});

test('rewards refer to real dinos', () => {
  for (const l of LEVELS) if (l.reward) assert.ok(DINOS.some((d) => d.id === l.reward), `${l.id} reward ${l.reward}`);
});

test('unlocking follows progress and placement', () => {
  assert.ok(isUnlocked('nest-1', {}));
  assert.ok(!isUnlocked('nest-2', {}));
  assert.ok(isUnlocked('nest-2', { 'nest-1': { stars: 3 } }));
  assert.ok(!isUnlocked('nest-2', { 'nest-1': { stars: 0 } }));
  // Starting in the jungle unlocks everything before it plus the first jungle level.
  assert.ok(isUnlocked('meadow-5', {}, { startWorld: 2 }));
  assert.ok(isUnlocked('jungle-1', {}, { startWorld: 2 }));
  assert.ok(!isUnlocked('jungle-2', {}, { startWorld: 2 }));
  assert.ok(isUnlocked('sky-7', {}, { unlockAll: true }));
  assert.equal(currentLevel({}, { startWorld: 2 }).id, 'jungle-1');
  assert.equal(currentLevel({ 'nest-1': { stars: 1 } }).id, 'nest-2');
  assert.equal(nextLevel('nest-7').id, 'meadow-1');
  assert.equal(nextLevel('sky-7'), null);
});

test('star scoring', () => {
  assert.equal(starsFor(getLevel('nest-1'), { accuracy: 10, wpm: 0 }), 3);
  const l = getLevel('jungle-3'); // minAcc 70, target 9
  assert.equal(starsFor(l, { accuracy: 60, wpm: 30 }), 0);
  assert.equal(starsFor(l, { accuracy: 75, wpm: 30 }), 1);
  assert.equal(starsFor(l, { accuracy: 90, wpm: 7 }), 2);
  assert.equal(starsFor(l, { accuracy: 90, wpm: 3 }), 1);
  assert.equal(starsFor(l, { accuracy: 97, wpm: 9 }), 3);
  const m = getLevel('meadow-7'); // meteor: no speed target
  assert.equal(starsFor(m, { accuracy: 100, wpm: 0 }), 3);
});

test('layout helpers', () => {
  assert.deepEqual(keyFor('f'), { key: 'f', finger: 'L2', shift: null });
  assert.deepEqual(keyFor('F'), { key: 'f', finger: 'L2', shift: 'ShiftRight' });
  assert.deepEqual(keyFor('?'), { key: '/', finger: 'R5', shift: 'ShiftLeft' });
  assert.equal(keyFor(' ').finger, 'TH');
  assert.match(fingerHint('J'), /right pointer.*left pinky/);
  assert.equal(spokenName(';'), 'semicolon');
  assert.equal(spokenName('k'), 'K');
});
