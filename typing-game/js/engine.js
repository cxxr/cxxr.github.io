// Core typing logic shared by all game modes. Pure (time is injected) so it can be tested.

/** Turn a KeyboardEvent.key value into a single typed character, or null to ignore it. */
export function normalizeKey(key) {
  if (key === 'Spacebar' || key === 'Space') return ' ';
  if (typeof key !== 'string' || key.length !== 1) return null;
  return key;
}

/** Words per minute using the standard 5-characters-per-word convention. */
export function computeWpm(chars, ms) {
  if (!ms || ms <= 0) return 0;
  return chars / 5 / (ms / 60000);
}

export function accuracyOf(correct, errors) {
  const total = correct + errors;
  return total === 0 ? 100 : (correct / total) * 100;
}

/** Collects per-key first-try hits/misses and reaction times for one session. */
export class KeyTracker {
  constructor() { this.keys = {}; }

  record(ch, hit, ms) {
    const k = (this.keys[ch] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });
    if (hit) k.hits++; else k.misses++;
    if (ms != null && ms > 0 && ms < 5000) { k.ms += ms; k.timed++; }
  }
}

/**
 * One run through a fixed piece of text. The cursor only advances on the correct
 * key – mistakes are counted but never need to be deleted, which keeps things
 * simple for young children.
 */
export class TypingSession {
  constructor(text, { now = () => performance.now(), tracker = new KeyTracker() } = {}) {
    this.text = text;
    this.now = now;
    this.tracker = tracker;
    this.index = 0;
    this.correct = 0;
    this.errors = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.startedAt = null;
    this.finishedAt = null;
    this.lastAt = null;
    this.missedHere = false;
  }

  get current() { return this.text[this.index]; }
  get done() { return this.index >= this.text.length; }
  get progress() { return this.text.length ? this.index / this.text.length : 1; }

  press(ch) {
    if (this.done || ch == null) return { type: 'ignored' };
    const t = this.now();
    if (this.startedAt == null) this.startedAt = t;
    const expected = this.text[this.index];
    if (ch === expected) {
      this.tracker.record(expected, !this.missedHere, this.lastAt == null ? null : t - this.lastAt);
      this.correct++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      this.lastAt = t;
      this.missedHere = false;
      const index = this.index++;
      if (this.done) this.finishedAt = t;
      return { type: 'correct', index, expected, done: this.done, streak: this.streak };
    }
    this.errors++;
    this.streak = 0;
    this.missedHere = true;
    return { type: 'wrong', index: this.index, expected, got: ch };
  }

  elapsed() {
    if (this.startedAt == null) return 0;
    return (this.finishedAt ?? this.now()) - this.startedAt;
  }

  stats() {
    const elapsedMs = this.elapsed();
    return {
      chars: this.index,
      correct: this.correct,
      errors: this.errors,
      accuracy: accuracyOf(this.correct, this.errors),
      wpm: computeWpm(this.index, elapsedMs),
      elapsedMs,
      bestStreak: this.bestStreak,
    };
  }
}

/**
 * Merge one session's per-key stats into a player's long-term stats. Old data is
 * halved once a key has lots of samples so recent practice counts most.
 */
export function mergeKeyStats(into, session) {
  for (const [ch, s] of Object.entries(session)) {
    const k = (into[ch] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });
    k.hits += s.hits; k.misses += s.misses; k.ms += s.ms; k.timed += s.timed;
    if (k.hits + k.misses > 300) {
      for (const f of ['hits', 'misses', 'ms', 'timed']) k[f] = Math.round(k[f] / 2);
    }
  }
  return into;
}

/** Smoothed miss rate (0..1) for a key. */
export function missRate(s) {
  if (!s) return 0;
  return (s.misses + 0.5) / (s.hits + s.misses + 2);
}

/**
 * Turn long-term key stats into generator weights: keys that are missed often or
 * typed slowly get picked more.
 */
export function weightsFromKeyStats(keyStats = {}) {
  const avgMs = (() => {
    let ms = 0; let n = 0;
    for (const s of Object.values(keyStats)) { ms += s.ms; n += s.timed; }
    return n ? ms / n : 0;
  })();
  const weights = {};
  for (const [ch, s] of Object.entries(keyStats)) {
    let w = 1 + 6 * missRate(s);
    if (avgMs && s.timed >= 3) w *= Math.min(2, Math.max(0.75, (s.ms / s.timed) / avgMs));
    weights[ch] = w;
  }
  return weights;
}

/** The keys a player finds hardest, worst first. */
export function trickyKeys(keyStats = {}, n = 6) {
  return Object.entries(keyStats)
    .filter(([ch, s]) => ch !== ' ' && s.hits + s.misses >= 4)
    .sort((a, b) => missRate(b[1]) - missRate(a[1]))
    .slice(0, n)
    .map(([ch]) => ch);
}
