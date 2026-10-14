import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TypingSession, normalizeKey, computeWpm, mergeKeyStats, weightsFromKeyStats, trickyKeys, missRate } from '../js/engine.js';

function clock() {
  let t = 0;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

test('normalizeKey', () => {
  assert.equal(normalizeKey('a'), 'a');
  assert.equal(normalizeKey(' '), ' ');
  assert.equal(normalizeKey('Spacebar'), ' ');
  assert.equal(normalizeKey('Shift'), null);
  assert.equal(normalizeKey('Enter'), null);
});

test('wpm uses 5 chars per word', () => {
  assert.equal(computeWpm(50, 60000), 10);
  assert.equal(computeWpm(10, 0), 0);
});

test('session advances only on correct keys and tracks stats', () => {
  const now = clock();
  const s = new TypingSession('fj f', { now });
  assert.equal(s.current, 'f');
  assert.equal(s.press('f').type, 'correct');
  now.advance(1000);
  assert.equal(s.press('k').type, 'wrong');
  assert.equal(s.index, 1);
  assert.equal(s.press('j').type, 'correct');
  now.advance(1000);
  s.press(' ');
  now.advance(1000);
  const last = s.press('f');
  assert.ok(last.done);
  assert.ok(s.done);
  assert.equal(s.press('f').type, 'ignored');
  const st = s.stats();
  assert.equal(st.chars, 4);
  assert.equal(st.errors, 1);
  assert.equal(st.accuracy, 80);
  assert.equal(st.elapsedMs, 3000);
  assert.equal(Math.round(st.wpm), 16); // 4 chars in 3s
  assert.equal(st.bestStreak, 3);
  // 'j' was missed on the first try; 'f' was hit both times.
  assert.equal(s.tracker.keys.j.misses, 1);
  assert.equal(s.tracker.keys.f.hits, 2);
});

test('key stats merge and drive weights', () => {
  const total = {};
  mergeKeyStats(total, { a: { hits: 9, misses: 1, ms: 0, timed: 0 }, s: { hits: 2, misses: 8, ms: 0, timed: 0 } });
  mergeKeyStats(total, { a: { hits: 1, misses: 0, ms: 0, timed: 0 } });
  assert.equal(total.a.hits, 10);
  assert.ok(missRate(total.s) > missRate(total.a));
  const w = weightsFromKeyStats(total);
  assert.ok(w.s > w.a);
  assert.deepEqual(trickyKeys(total), ['s', 'a']);
});

test('old key stats decay', () => {
  const total = { a: { hits: 300, misses: 0, ms: 0, timed: 0 } };
  mergeKeyStats(total, { a: { hits: 0, misses: 10, ms: 0, timed: 0 } });
  assert.equal(total.a.hits, 150);
  assert.equal(total.a.misses, 5);
});
