// Sound effects, gentle background music (all synthesized with WebAudio – no
// audio files) and spoken prompts via the Web Speech API.

let ctx = null;
let master = null;
let musicGain = null;
const state = { sound: true, voice: true, music: true };

function ac() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.12;
      musicGain.connect(master);
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  } catch (err) {
    console.warn('WebAudio initialization failed:', err);
    return null;
  }
}

/** Browsers only allow audio after a user gesture – call this from one. */
export function unlockAudio() {
  try { ac(); } catch (e) { /* ignore */ }
}

export function configureAudio(settings) {
  Object.assign(state, settings);
  if (!state.music) stopMusic();
  if (!state.voice && 'speechSynthesis' in window) speechSynthesis.cancel();
}

function tone(freq, { dur = 0.15, type = 'sine', vol = 0.3, when = 0, slide = null, attack = 0.01, out = null } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out || master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise({ dur = 0.3, vol = 0.2, when = 0, freq = 800, q = 1, type = 'bandpass' } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

// C major pentatonic, so any sequence of "correct" pops sounds musical.
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

export const sfx = {
  correct(streak = 0) {
    if (!state.sound) return;
    const f = PENTA[streak % PENTA.length];
    tone(f, { dur: 0.12, type: 'triangle', vol: 0.25 });
    tone(f * 2, { dur: 0.08, type: 'sine', vol: 0.08 });
  },
  wrong() {
    if (!state.sound) return;
    tone(220, { dur: 0.18, type: 'triangle', vol: 0.18, slide: 180 });
  },
  step() {
    if (!state.sound) return;
    noise({ dur: 0.08, vol: 0.12, freq: 300, q: 0.8, type: 'lowpass' });
  },
  crack() {
    if (!state.sound) return;
    noise({ dur: 0.12, vol: 0.35, freq: 2500, q: 2 });
    tone(900, { dur: 0.05, type: 'square', vol: 0.05 });
  },
  hatch() {
    if (!state.sound) return;
    noise({ dur: 0.25, vol: 0.3, freq: 1800, q: 1.5 });
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => tone(f, { dur: 0.25, type: 'triangle', vol: 0.22, when: 0.1 + i * 0.09 }));
  },
  star(i = 0) {
    if (!state.sound) return;
    tone(880 * Math.pow(1.26, i), { dur: 0.35, type: 'sine', vol: 0.25 });
    tone(1760 * Math.pow(1.26, i), { dur: 0.25, type: 'triangle', vol: 0.08, when: 0.05 });
  },
  fanfare() {
    if (!state.sound) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.12, 0.24, 0.36, 0.52, 0.64];
    notes.forEach((f, i) => tone(f, { dur: i === notes.length - 1 ? 0.6 : 0.16, type: 'triangle', vol: 0.25, when: times[i] }));
  },
  tryAgain() {
    if (!state.sound) return;
    [523.25, 466.16, 392].forEach((f, i) => tone(f, { dur: 0.25, type: 'triangle', vol: 0.2, when: i * 0.18 }));
  },
  roar() {
    if (!state.sound) return;
    tone(160, { dur: 0.6, type: 'sawtooth', vol: 0.12, slide: 70, attack: 0.05 });
    noise({ dur: 0.6, vol: 0.18, freq: 500, q: 0.7 });
  },
  zap() {
    if (!state.sound) return;
    tone(1200, { dur: 0.15, type: 'square', vol: 0.06, slide: 2400 });
    tone(1568, { dur: 0.3, type: 'sine', vol: 0.18, when: 0.08 });
  },
  poof() {
    if (!state.sound) return;
    noise({ dur: 0.35, vol: 0.18, freq: 400, q: 0.6, type: 'lowpass' });
  },
  click() {
    if (!state.sound) return;
    tone(660, { dur: 0.05, type: 'sine', vol: 0.15 });
  },
};

// ---------- background music: a soft, looping pentatonic marimba tune ----------
let musicTimer = null;
let musicStep = 0;
let nextNoteTime = 0;
const TEMPO = 0.28; // seconds per step
const MELODY = [0, 2, 4, 2, 5, 4, 2, -1, 1, 3, 4, 3, 2, 1, 0, -1, 0, 2, 4, 5, 7, 5, 4, -1, 3, 2, 1, 2, 0, -1, -1, -1];
const BASS = [261.63, 261.63, 220, 220, 174.61, 174.61, 196, 196];

export function startMusic() {
  if (!state.music || musicTimer) return;
  const c = ac();
  if (!c) return;
  nextNoteTime = c.currentTime + 0.1;
  musicTimer = setInterval(() => {
    while (nextNoteTime < c.currentTime + 0.3) {
      const step = musicStep % MELODY.length;
      const m = MELODY[step];
      const when = nextNoteTime - c.currentTime;
      if (m >= 0) tone(PENTA[m] / 2, { dur: 0.35, type: 'sine', vol: 0.5, when, out: musicGain });
      if (step % 4 === 0) tone(BASS[(step / 4) % BASS.length] / 2, { dur: 0.9, type: 'triangle', vol: 0.5, when, out: musicGain });
      musicStep++;
      nextNoteTime += TEMPO;
    }
  }, 100);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

// ---------- speech ----------
let preferredVoice = null;
function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return null;
  try {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const en = voices.filter((v) => /^en/i.test(v.lang));
    const nice = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Serena', 'Tessa', 'Fiona'];
    preferredVoice = nice.map((n) => en.find((v) => v.name.includes(n))).find(Boolean) || en[0] || null;
    return preferredVoice;
  } catch (e) {
    return null;
  }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
  try {
    window.speechSynthesis.onvoiceschanged = pickVoice;
  } catch (e) {
    // ignore
  }
}

/** Speak a short phrase. Interrupts anything already being said. */
export function say(text, { rate = 0.95, pitch = 1.25, interrupt = true } = {}) {
  if (!state.voice || typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis || !text) return;
  try {
    if (interrupt) window.speechSynthesis.cancel();
    if (typeof SpeechSynthesisUtterance !== 'undefined') {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      const v = preferredVoice || pickVoice();
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
}
