import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, STORAGE_KEY, totalStars } from '../js/storage.js';

function backend() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), m };
}

test('profiles persist across store instances', () => {
  const b = backend();
  const s = new Store(b);
  const p = s.createProfile({ name: '  Ada  ', startWorld: 2 });
  assert.equal(p.name, 'Ada');
  assert.equal(s.current.id, p.id);
  const s2 = new Store(b);
  assert.equal(s2.current.name, 'Ada');
  assert.equal(s2.current.startWorld, 2);
  assert.equal(s2.current.settings.sound, true);
});

test('recordResult keeps best stars and awards dinos once', () => {
  const s = new Store(backend());
  s.createProfile({ name: 'Kid' });
  let r = s.recordResult('nest-2', { stars: 3, stats: { wpm: 0, accuracy: 90, chars: 8, elapsedMs: 5000 } });
  assert.equal(r.newDino, 'trixie');
  assert.ok(r.firstClear);
  r = s.recordResult('nest-2', { stars: 1, stats: { wpm: 0, accuracy: 50 } });
  assert.equal(r.newDino, null);
  assert.equal(s.current.levels['nest-2'].stars, 3);
  assert.equal(s.current.levels['nest-2'].plays, 2);
  assert.deepEqual(s.current.dinos, ['rexy', 'trixie']);
  assert.equal(totalStars(s.current), 3);
});

test('no reward for a failed attempt', () => {
  const s = new Store(backend());
  s.createProfile({ name: 'Kid' });
  const r = s.recordResult('meadow-7', { stars: 0, stats: { accuracy: 10 } });
  assert.equal(r.newDino, null);
});

test('corrupt storage falls back to empty', () => {
  const b = backend();
  b.setItem(STORAGE_KEY, '{not json');
  const s = new Store(b);
  assert.equal(s.profiles.length, 0);
});

test('reset and delete', () => {
  const s = new Store(backend());
  const p = s.createProfile({ name: 'A' });
  s.recordResult('nest-1', { stars: 3, perKey: { ' ': { hits: 3, misses: 0, ms: 0, timed: 0 } } });
  s.resetProgress();
  assert.deepEqual(s.current.levels, {});
  assert.deepEqual(s.current.keyStats, {});
  s.deleteProfile(p.id);
  assert.equal(s.current, null);
});
