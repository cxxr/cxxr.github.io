// Player profiles & progress, persisted to localStorage (or any getItem/setItem backend).
import { getLevel } from './curriculum.js';
import { mergeKeyStats } from './engine.js';
import { STARTER_DINO } from './dinos.js';

export const STORAGE_KEY = 'dinoKeys.v1';

export const DEFAULT_SETTINGS = {
  sound: true,
  voice: true,
  music: true,
  keyboard: true,   // show the on-screen keyboard
  hands: true,      // show the finger guide hands
  unlockAll: false,
};

function memoryBackend() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function getDefaultBackend() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('__dino_test__', '1');
      localStorage.removeItem('__dino_test__');
      return localStorage;
    }
  } catch (e) {
    console.warn('localStorage not accessible, using memory storage', e);
  }
  return memoryBackend();
}

export class Store {
  constructor(backend) {
    this.backend = backend || getDefaultBackend();
    this.data = { version: 1, currentId: null, profiles: [] };
    this.load();
  }

  load() {
    try {
      const raw = this.backend.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.profiles)) this.data = parsed;
      }
    } catch (e) {
      console.warn('Could not load saved progress', e);
    }
    for (const p of this.data.profiles) p.settings = { ...DEFAULT_SETTINGS, ...p.settings };
  }

  save() {
    try {
      this.backend.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  }

  get profiles() { return this.data.profiles; }

  get current() {
    return this.data.profiles.find((p) => p.id === this.data.currentId) || null;
  }

  select(id) {
    this.data.currentId = id;
    this.save();
    return this.current;
  }

  createProfile({ name, startWorld = 0 }) {
    const p = {
      id: uid(),
      name: (name || 'Player').trim().slice(0, 16) || 'Player',
      startWorld,
      buddy: STARTER_DINO,
      dinos: [STARTER_DINO],
      levels: {},
      keyStats: {},
      settings: { ...DEFAULT_SETTINGS },
      totals: { plays: 0, chars: 0, ms: 0 },
      createdAt: Date.now(),
    };
    this.data.profiles.push(p);
    this.data.currentId = p.id;
    this.save();
    return p;
  }

  deleteProfile(id) {
    this.data.profiles = this.data.profiles.filter((p) => p.id !== id);
    if (this.data.currentId === id) this.data.currentId = null;
    this.save();
  }

  /**
   * Record the outcome of a level for the current player.
   * @returns {{firstClear: boolean, newBest: boolean, newDino: string|null}}
   */
  recordResult(levelId, { stars, stats = {}, perKey = {} }) {
    const p = this.current;
    if (!p) throw new Error('No player selected');
    const prev = p.levels[levelId] || { stars: 0, bestWpm: 0, bestAcc: 0, plays: 0 };
    const entry = {
      stars: Math.max(prev.stars, stars),
      bestWpm: Math.max(prev.bestWpm, Math.round(stats.wpm || 0)),
      bestAcc: Math.max(prev.bestAcc, Math.round(stats.accuracy || 0)),
      plays: prev.plays + 1,
    };
    p.levels[levelId] = entry;
    mergeKeyStats(p.keyStats, perKey);
    p.totals.plays++;
    p.totals.chars += stats.chars || 0;
    p.totals.ms += stats.elapsedMs || 0;

    let newDino = null;
    const level = getLevel(levelId);
    if (stars > 0 && level && level.reward && !p.dinos.includes(level.reward)) {
      p.dinos.push(level.reward);
      newDino = level.reward;
    }
    this.save();
    return { firstClear: prev.stars === 0 && stars > 0, newBest: stars > prev.stars, newDino };
  }

  /** Merge key stats without a level result (e.g. free practice). */
  recordPractice({ stats = {}, perKey = {} }) {
    const p = this.current;
    if (!p) return;
    mergeKeyStats(p.keyStats, perKey);
    p.totals.plays++;
    p.totals.chars += stats.chars || 0;
    p.totals.ms += stats.elapsedMs || 0;
    this.save();
  }

  setBuddy(dinoId) {
    const p = this.current;
    if (p && p.dinos.includes(dinoId)) { p.buddy = dinoId; this.save(); }
  }

  updateSettings(patch) {
    const p = this.current;
    if (!p) return;
    p.settings = { ...p.settings, ...patch };
    this.save();
  }

  updateProfile(patch) {
    const p = this.current;
    if (!p) return;
    Object.assign(p, patch);
    this.save();
  }

  resetProgress() {
    const p = this.current;
    if (!p) return;
    p.levels = {};
    p.keyStats = {};
    p.dinos = [STARTER_DINO];
    p.buddy = STARTER_DINO;
    p.totals = { plays: 0, chars: 0, ms: 0 };
    this.save();
  }
}

export function totalStars(profile) {
  return Object.values(profile.levels).reduce((n, l) => n + (l.stars || 0), 0);
}
