// Keyboard & Hands visual component. Renders the interactive touch-typing
// keyboard and animated hands guide.
import { ROWS, FINGER_COLOR_VAR, keyFor, fingerHint, capLabel } from './layout.js';

function handSVG(side) {
  const isLeft = side === 'left';
  // Finger IDs in left-to-right order on the illustration
  const fIds = isLeft ? ['L5', 'L4', 'L3', 'L2', 'TH'] : ['TH', 'R2', 'R3', 'R4', 'R5'];
  const fingerPaths = isLeft
    ? [
        // Left Pinky
        { id: 'L5', d: 'M12 75 Q10 40 16 35 Q22 40 22 75 Z', tip: [16, 35] },
        // Left Ring
        { id: 'L4', d: 'M25 70 Q24 22 32 18 Q40 22 40 70 Z', tip: [32, 18] },
        // Left Middle
        { id: 'L3', d: 'M44 68 Q44 10 52 8 Q60 10 60 68 Z', tip: [52, 8] },
        // Left Index
        { id: 'L2', d: 'M64 72 Q66 22 74 20 Q82 22 82 72 Z', tip: [74, 20] },
        // Left Thumb
        { id: 'TH', d: 'M84 85 Q98 62 102 68 Q96 95 86 100 Z', tip: [100, 65] },
      ]
    : [
        // Right Thumb
        { id: 'TH', d: 'M20 85 Q6 62 2 68 Q8 95 18 100 Z', tip: [4, 65] },
        // Right Index
        { id: 'R2', d: 'M22 72 Q20 22 28 20 Q36 22 38 72 Z', tip: [28, 20] },
        // Right Middle
        { id: 'R3', d: 'M42 68 Q42 10 50 8 Q58 10 58 68 Z', tip: [50, 8] },
        // Right Ring
        { id: 'R4', d: 'M62 70 Q62 22 70 18 Q78 22 77 70 Z', tip: [70, 18] },
        // Right Pinky
        { id: 'R5', d: 'M80 75 Q80 40 86 35 Q92 40 90 75 Z', tip: [86, 35] },
      ];

  const palmD = isLeft
    ? 'M14 74 Q52 68 86 80 L88 116 Q52 124 16 116 Z'
    : 'M16 80 Q50 68 88 74 L86 116 Q50 124 14 116 Z';

  const fingersMarkup = fingerPaths
    .map(({ id, d, tip }) => {
      const colVar = FINGER_COLOR_VAR[id];
      return `
      <g class="hand-finger" data-finger="${id}">
        <path d="${d}" fill="var(${colVar})" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
        <circle class="hand-finger-ring" cx="${tip[0]}" cy="${tip[1]}" r="8" fill="none" stroke="#ff9f43" stroke-width="3"/>
      </g>`;
    })
    .join('');

  return `
    <svg viewBox="0 0 104 125" xmlns="http://www.w3.org/2000/svg" aria-label="${side} hand">
      <ellipse cx="52" cy="120" rx="36" ry="5" fill="#000" opacity="0.1"/>
      <path d="${palmD}" fill="#fcd5b5" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      ${fingersMarkup}
      <text x="52" y="105" text-anchor="middle" font-size="11" font-weight="700" fill="#7a5538">${isLeft ? 'LEFT' : 'RIGHT'}</text>
    </svg>`;
}

export class KeyboardView {
  constructor({ kbEl, leftHandEl, rightHandEl, hintEl, onKeyPress } = {}) {
    this.kbEl = kbEl;
    this.leftHandEl = leftHandEl;
    this.rightHandEl = rightHandEl;
    this.hintEl = hintEl;
    this.onKeyPress = onKeyPress;
    this.keyMap = new Map();
    this.render();
  }

  render() {
    if (this.leftHandEl) this.leftHandEl.innerHTML = handSVG('left');
    if (this.rightHandEl) this.rightHandEl.innerHTML = handSVG('right');

    if (!this.kbEl) return;
    this.kbEl.innerHTML = '';
    this.keyMap.clear();

    for (const row of ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      for (const [id, label, finger, units] of row) {
        const keyEl = document.createElement('button');
        keyEl.type = 'button';
        keyEl.className = `key ${id === ' ' ? 'space' : ''}`;
        keyEl.dataset.key = id;
        if (units) keyEl.dataset.units = units;
        keyEl.style.setProperty('--finger-color', `var(${FINGER_COLOR_VAR[finger]})`);
        keyEl.textContent = capLabel(label);

        // Tap/click support for tablet / mouse users
        let lastPress = 0;
        const triggerKey = (e) => {
          e.preventDefault();
          const now = Date.now();
          if (now - lastPress < 120) return;
          lastPress = now;
          this.flashPress(id);
          if (this.onKeyPress) {
            let ch = id;
            if (this.currentTargetShift && /^[a-z]$/.test(ch)) ch = ch.toUpperCase();
            this.onKeyPress(ch);
          }
        };

        keyEl.addEventListener('pointerdown', triggerKey);
        keyEl.addEventListener('click', triggerKey);

        rowEl.appendChild(keyEl);
        this.keyMap.set(id, keyEl);
      }
      this.kbEl.appendChild(rowEl);
    }
  }

  /**
   * Highlight target key, Shift key if required, and the corresponding finger.
   */
  highlight(ch) {
    this.clear();
    if (!ch) return;
    const info = keyFor(ch);
    if (!info) return;

    this.currentTargetShift = !!info.shift;

    // Highlight main key
    const el = this.keyMap.get(info.key);
    if (el) el.classList.add('target');

    // Highlight shift key if needed
    if (info.shift) {
      const shiftEl = this.keyMap.get(info.shift);
      if (shiftEl) shiftEl.classList.add('shift-needed');
    }

    // Highlight finger on hand
    const fingerId = info.finger;
    const handEl = fingerId.startsWith('L') ? this.leftHandEl : this.rightHandEl;
    if (handEl) {
      const f = handEl.querySelector(`.hand-finger[data-finger="${fingerId}"]`);
      if (f) f.classList.add('active');
    }

    // Also highlight shift hand finger if shifted
    if (info.shift) {
      const sHand = info.shift === 'ShiftLeft' ? this.leftHandEl : this.rightHandEl;
      if (sHand) {
        const sFinger = sHand.querySelector(`.hand-finger[data-finger="${info.shift === 'ShiftLeft' ? 'L5' : 'R5'}"]`);
        if (sFinger) sFinger.classList.add('active');
      }
    }

    // Update finger hint text
    if (this.hintEl) {
      const text = fingerHint(ch);
      const colVar = FINGER_COLOR_VAR[info.finger];
      this.hintEl.innerHTML = `<span class="finger-dot" style="background:var(${colVar})"></span> ${text}`;
    }
  }

  flashPress(key) {
    const el = this.keyMap.get(key) || this.keyMap.get(key.toLowerCase());
    if (el) {
      el.classList.add('pressed');
      setTimeout(() => el.classList.remove('pressed'), 140);
    }
  }

  clear() {
    this.currentTargetShift = false;
    if (this.kbEl) {
      this.kbEl.querySelectorAll('.key.target, .key.shift-needed').forEach((k) => {
        k.classList.remove('target', 'shift-needed');
      });
    }
    document.querySelectorAll('.hand-finger.active').forEach((f) => f.classList.remove('active'));
    if (this.hintEl) this.hintEl.textContent = '';
  }

  setVisible(showKb, showHands) {
    if (this.kbEl) this.kbEl.style.display = showKb ? '' : 'none';
    if (this.leftHandEl) this.leftHandEl.style.display = showHands ? '' : 'none';
    if (this.rightHandEl) this.rightHandEl.style.display = showHands ? '' : 'none';
  }
}
