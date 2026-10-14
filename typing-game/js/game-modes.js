// The 4 interactive game modes: Hatch, Trail, Meteor, Race.
import { TypingSession, normalizeKey } from './engine.js';
import { dinoSVG, eggSVG, nestSVG, meteorSVG } from './dino-art.js';
import { getDino } from './dinos.js';
import { spokenName, capLabel } from './layout.js';
import { sfx, say } from './audio.js';
import { fx } from './fx.js';

/** Base mode with common event dispatch and stats */
class ModeRunner {
  constructor({ stageEl, sceneCtrl, kbView, level, pool, content, buddy, onComplete, onProgress }) {
    this.stageEl = stageEl;
    this.sceneCtrl = sceneCtrl;
    this.kbView = kbView;
    this.level = level;
    this.pool = pool;
    this.content = content;
    this.buddy = getDino(buddy);
    this.onComplete = onComplete;
    this.onProgress = onProgress;
    this.destroyed = false;
  }

  destroy() {
    this.destroyed = true;
    this.stageEl.innerHTML = '';
    this.kbView.clear();
  }
}

/* ==========================================================================
   Mode 1: Hatch Mode (Egg in nest, 4-year-old friendly)
   ========================================================================== */
export class HatchMode extends ModeRunner {
  start() {
    this.keys = Array.isArray(this.content) ? this.content : [...this.content];
    this.idx = 0;
    this.cracks = 0;
    this.errors = 0;
    this.correct = 0;
    this.total = this.keys.length;
    this.perKey = {};

    const rewardDino = this.level.reward ? getDino(this.level.reward) : this.buddy;

    this.stageEl.innerHTML = `
      <div class="hatch-stage">
        <div class="big-target-key" id="big-target"></div>
        <div class="hatch-nest-wrap">
          <div id="egg-container">${eggSVG({ color: rewardDino.belly, spot: rewardDino.accent })}</div>
          <div class="hatch-baby" id="hatch-baby">${dinoSVG(rewardDino)}</div>
          ${nestSVG()}
        </div>
      </div>
    `;

    this.eggEl = this.stageEl.querySelector('.egg');
    this.bigKeyEl = document.getElementById('big-target');
    this.babyEl = document.getElementById('hatch-baby');

    // Allow tapping/clicking the big target key directly
    let lastTapTime = 0;
    const onTapBigKey = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTapTime < 140) return;
      lastTapTime = now;
      if (this.keys && this.idx < this.total) {
        this.handleKey(this.keys[this.idx]);
      }
    };
    this.bigKeyEl?.addEventListener('pointerdown', onTapBigKey);
    this.bigKeyEl?.addEventListener('click', onTapBigKey);

    this.showNextKey(true);
  }

  showNextKey(isInitial = false) {
    if (this.destroyed) return;
    if (this.idx >= this.total) {
      this.finishHatch();
      return;
    }

    const currentKey = this.keys[this.idx];
    const isSpace = currentKey === ' ';

    if (this.bigKeyEl) {
      this.bigKeyEl.textContent = isSpace ? 'SPACE' : capLabel(currentKey);
      this.bigKeyEl.classList.toggle('space-bar', isSpace);
    }

    this.kbView.highlight(currentKey);

    // Voice prompt
    const name = spokenName(currentKey);
    const phrase = isInitial && this.level.intro ? this.level.intro : `Press ${name}`;
    say(phrase, { pitch: 1.3, rate: 0.9 });

    if (this.onProgress) {
      this.onProgress(this.idx / this.total, `${this.idx} / ${this.total}`);
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || this.idx >= this.total) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    const expected = this.keys[this.idx];
    const isHit = ch === expected;

    const kStats = (this.perKey[expected] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });

    if (isHit) {
      this.correct++;
      kStats.hits++;
      try { sfx.correct(this.idx); } catch (e) {}

      // Egg cracks & visual reactions (use setAttribute on SVGElement)
      this.cracks = Math.min(4, Math.floor(((this.idx + 1) / this.total) * 4));
      this.eggEl?.setAttribute('class', `egg crack-stage-${this.cracks} shake`);
      setTimeout(() => this.eggEl?.classList.remove('shake'), 320);

      try {
        if (this.bigKeyEl) {
          const r = this.bigKeyEl.getBoundingClientRect();
          fx.starBurst(r.left + r.width / 2, r.top + r.height / 2, 6);
        }
      } catch (e) {}
      try { sfx.crack(); } catch (e) {}

      this.idx++;
      setTimeout(() => this.showNextKey(), 280);
    } else {
      this.errors++;
      kStats.misses++;
      try { sfx.wrong(); } catch (e) {}
      try { if (this.bigKeyEl) fx.shake(this.bigKeyEl); } catch (e) {}
      try { say(`Try again. Find ${spokenName(expected)}!`); } catch (e) {}
    }
  }

  finishHatch() {
    this.kbView.clear();
    if (this.bigKeyEl) this.bigKeyEl.style.display = 'none';

    // Pop the egg open! (use setAttribute on SVGElement)
    this.eggEl?.setAttribute('class', 'egg hatched');
    try { sfx.hatch(); } catch (e) {}

    setTimeout(() => {
      if (this.babyEl) {
        this.babyEl.classList.add('show');
        const babySvg = this.babyEl.querySelector('.dino');
        babySvg?.classList.add('celebrating', 'roaring');
      }

      try { sfx.roar(); } catch (e) {}
      try { fx.confetti(60); } catch (e) {}

      try {
        if (this.babyEl) {
          const babyRect = this.babyEl.getBoundingClientRect();
          fx.starBurst(babyRect.left + babyRect.width / 2, babyRect.top + babyRect.height / 2, 12);
        }
      } catch (e) {}

      setTimeout(() => {
        if (this.onComplete) {
          this.onComplete({
            accuracy: 100, // hatch always succeeds for little ones
            wpm: 0,
            chars: this.total,
            errors: this.errors,
            elapsedMs: 12000,
            bestStreak: this.total,
            perKey: this.perKey,
          });
        }
      }, 2200);
    }, 450);
  }
}

/* ==========================================================================
   Mode 2: Trail Mode (Dino walks as you type each letter)
   ========================================================================== */
export class TrailMode extends ModeRunner {
  start() {
    this.text = typeof this.content === 'string' ? this.content : this.content.join(' ');
    this.session = new TypingSession(this.text);
    this.scrollPx = 0;

    this.stageEl.innerHTML = `
      <div class="trail-stage">
        <div class="trail-dino-wrap" id="trail-dino">
          ${dinoSVG(this.buddy, { className: 'walking' })}
        </div>
        <div class="text-stream" id="text-stream"></div>
      </div>
    `;

    this.dinoEl = this.stageEl.querySelector('#trail-dino');
    this.streamEl = this.stageEl.querySelector('#text-stream');

    this.renderTextStream();
    this.updateTarget();

    if (this.level.intro) {
      say(this.level.intro, { pitch: 1.25, rate: 0.95 });
    }
  }

  renderTextStream() {
    this.streamEl.innerHTML = '';
    const spanList = [];
    const len = this.text.length;
    // Show a sliding window of characters centered around current index
    const windowStart = Math.max(0, this.session.index - 5);
    const windowEnd = Math.min(len, windowStart + 16);

    for (let i = windowStart; i < windowEnd; i++) {
      const ch = this.text[i];
      const isSpace = ch === ' ';
      const span = document.createElement('span');
      span.className = `stone-char ${isSpace ? 'space' : ''}`;
      if (i < this.session.index) span.classList.add('completed');
      else if (i === this.session.index) span.classList.add('active');
      span.textContent = isSpace ? '␣' : ch;
      this.streamEl.appendChild(span);
      spanList.push(span);
    }
    this.activeSpan = spanList.find((s) => s.classList.contains('active'));
  }

  updateTarget() {
    if (this.destroyed || this.session.done) return;
    const cur = this.session.current;
    this.kbView.highlight(cur);
    this.renderTextStream();

    if (this.onProgress) {
      const st = this.session.stats();
      this.onProgress(this.session.progress, `${Math.round(st.wpm)} WPM · ${Math.round(st.accuracy)}%`);
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || this.session.done) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    const res = this.session.press(ch);
    this.kbView.flashPress(ch);

    if (res.type === 'correct') {
      sfx.correct(res.streak);
      sfx.step();

      // Parallax scroll & dino footstep dust
      this.scrollPx += 26;
      this.sceneCtrl.scrollTo(this.scrollPx);

      if (this.dinoEl) {
        const dRect = this.dinoEl.getBoundingClientRect();
        fx.dust(dRect.left + 50, dRect.bottom - 10);
      }

      if (this.activeSpan) {
        const sRect = this.activeSpan.getBoundingClientRect();
        if (res.streak % 5 === 0) {
          fx.starBurst(sRect.left + sRect.width / 2, sRect.top + sRect.height / 2, 6);
        }
      }

      if (res.done) {
        this.finishTrail();
      } else {
        this.updateTarget();
      }
    } else if (res.type === 'wrong') {
      sfx.wrong();
      if (this.activeSpan) fx.shake(this.activeSpan);
      say(`Tap ${spokenName(res.expected)}`, { pitch: 1.2, rate: 1.0 });
    }
  }

  finishTrail() {
    this.kbView.clear();
    const dinoSvg = this.dinoEl.querySelector('.dino');
    dinoSvg?.classList.remove('walking');
    dinoSvg?.classList.add('celebrating', 'roaring');

    sfx.roar();
    fx.confetti(50);

    const st = this.session.stats();
    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete({
          ...st,
          perKey: this.session.tracker.keys,
        });
      }
    }, 1800);
  }
}

/* ==========================================================================
   Mode 3: Meteor Mode (Save the valley by zapping falling words/letters)
   ========================================================================== */
export class MeteorMode extends ModeRunner {
  start() {
    this.words = Array.isArray(this.content) ? [...this.content] : this.content.split(' ');
    this.meteors = [];
    this.total = this.words.length;
    this.completedCount = 0;
    this.errors = 0;
    this.correctChars = 0;
    this.perKey = {};
    this.startedAt = performance.now();
    this.fallSec = this.level.fall || 12;
    this.spawnSec = this.level.spawn || 3.2;

    this.stageEl.innerHTML = `<div class="meteor-stage" id="meteor-field"></div>`;
    this.fieldEl = document.getElementById('meteor-field');

    this.spawnNext();
    this.spawnTimer = setInterval(() => this.spawnNext(), this.spawnSec * 1000);
    this.animLoop = requestAnimationFrame(() => this.tick());

    if (this.level.intro) say(this.level.intro, { pitch: 1.25, rate: 0.95 });
  }

  spawnNext() {
    if (this.destroyed || !this.words.length) return;
    const maxOnScreen = this.level.maxOnScreen || 3;
    if (this.meteors.length >= maxOnScreen) return;

    const word = this.words.shift();
    const el = document.createElement('div');
    el.className = 'meteor-item';
    el.innerHTML = `
      ${meteorSVG()}
      <div class="meteor-label">${word}</div>
    `;

    // Spread meteors across the horizontal viewport
    const pad = 120;
    const maxLeft = Math.max(100, window.innerWidth - pad * 2);
    const left = pad + Math.random() * maxLeft;
    el.style.left = `${left}px`;
    el.style.top = '-120px';

    this.fieldEl.appendChild(el);

    const meteor = {
      word,
      matched: 0,
      el,
      labelEl: el.querySelector('.meteor-label'),
      spawnTime: performance.now(),
      targetY: window.innerHeight - 170,
    };

    this.meteors.push(meteor);
    this.updateActiveMeteorTarget();
  }

  tick() {
    if (this.destroyed) return;
    const now = performance.now();
    const groundY = window.innerHeight - 160;

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      const elapsed = (now - m.spawnTime) / 1000;
      const progress = elapsed / this.fallSec;
      const y = -100 + progress * (groundY + 100);

      m.el.style.top = `${y}px`;

      // If a meteor touches ground, it harmlessly disintegrates into smoke and reappears in the queue
      if (y >= groundY) {
        sfx.poof();
        fx.dust(parseFloat(m.el.style.left) + 40, groundY);
        m.el.remove();
        this.meteors.splice(i, 1);
        this.words.push(m.word); // put back in queue so level is always completable
        this.updateActiveMeteorTarget();
      }
    }

    this.animLoop = requestAnimationFrame(() => this.tick());
  }

  updateActiveMeteorTarget() {
    if (this.destroyed) return;
    this.meteors.forEach((m) => m.el.classList.remove('active-target'));
    const target = this.meteors[0];
    if (target) {
      target.el.classList.add('active-target');
      const nextChar = target.word[target.matched];
      this.kbView.highlight(nextChar);
    } else {
      this.kbView.clear();
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || !this.meteors.length) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    this.kbView.flashPress(ch);

    const m = this.meteors[0];
    const expected = m.word[m.matched];
    const isHit = ch === expected;

    const kStats = (this.perKey[expected] ||= { hits: 0, misses: 0, ms: 0, timed: 0 });

    if (isHit) {
      this.correctChars++;
      kStats.hits++;
      sfx.correct(m.matched);
      m.matched++;

      // Highlight matched letters in green
      const matchedPart = m.word.slice(0, m.matched);
      const remainingPart = m.word.slice(m.matched);
      m.labelEl.innerHTML = `<span class="meteor-matched">${matchedPart}</span>${remainingPart}`;

      if (m.matched >= m.word.length) {
        // Zapped the meteor!
        sfx.zap();
        const r = m.el.getBoundingClientRect();
        fx.starBurst(r.left + r.width / 2, r.top + r.height / 2, 10);
        m.el.remove();
        this.meteors.shift();
        this.completedCount++;

        if (this.onProgress) {
          this.onProgress(this.completedCount / this.total, `${this.completedCount} / ${this.total}`);
        }

        if (this.completedCount >= this.total) {
          this.finishMeteor();
          return;
        }
      }
      this.updateActiveMeteorTarget();
    } else {
      this.errors++;
      kStats.misses++;
      sfx.wrong();
      if (m) fx.shake(m.labelEl);
    }
  }

  finishMeteor() {
    clearInterval(this.spawnTimer);
    cancelAnimationFrame(this.animLoop);
    this.kbView.clear();

    fx.confetti(40);
    sfx.fanfare();

    const elapsedMs = performance.now() - this.startedAt;
    const totalChars = this.correctChars + this.errors;
    const accuracy = totalChars ? (this.correctChars / totalChars) * 100 : 100;

    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete({
          accuracy,
          wpm: (this.correctChars / 5) / (elapsedMs / 60000),
          chars: this.correctChars,
          errors: this.errors,
          elapsedMs,
          bestStreak: this.total,
          perKey: this.perKey,
        });
      }
    }, 1200);
  }

  destroy() {
    clearInterval(this.spawnTimer);
    cancelAnimationFrame(this.animLoop);
    super.destroy();
  }
}

/* ==========================================================================
   Mode 4: Race Mode (Race against Zip the pterodactyl)
   ========================================================================== */
export class RaceMode extends ModeRunner {
  start() {
    this.text = typeof this.content === 'string' ? this.content : this.content.join(' ');
    this.session = new TypingSession(this.text);
    this.targetWpm = this.level.targetWpm || 20;

    const zipDino = getDino('petra'); // rival pterodactyl

    this.stageEl.innerHTML = `
      <div class="race-stage">
        <div class="race-track">
          <div class="race-lane" id="lane-player">
            <div class="racer" id="racer-player">${dinoSVG(this.buddy, { className: 'flying walking' })}</div>
            <div class="race-finish-line"></div>
          </div>
          <div class="race-lane" id="lane-rival">
            <div class="racer" id="racer-rival">${dinoSVG(zipDino, { className: 'flying walking' })}</div>
            <div class="race-finish-line"></div>
          </div>
        </div>
        <div class="text-stream" id="text-stream"></div>
      </div>
    `;

    this.racerPlayer = document.getElementById('racer-player');
    this.racerRival = document.getElementById('racer-rival');
    this.streamEl = document.getElementById('text-stream');

    this.renderTextStream();
    this.updateTarget();

    // Start rival timer once first character is typed
    this.rivalStarted = false;
    this.rivalProgress = 0;
    this.rivalAnim = requestAnimationFrame(() => this.tickRival());

    if (this.level.intro) say(this.level.intro, { pitch: 1.25, rate: 0.95 });
  }

  tickRival() {
    if (this.destroyed) return;
    if (this.session.startedAt) {
      const elapsedSec = (performance.now() - this.session.startedAt) / 1000;
      const targetCps = (this.targetWpm * 5) / 60;
      this.rivalProgress = Math.min(0.96, (elapsedSec * targetCps) / this.text.length);

      const maxPx = this.racerRival.parentElement.clientWidth - 80;
      this.racerRival.style.left = `${this.rivalProgress * maxPx}px`;
    }
    this.rivalAnim = requestAnimationFrame(() => this.tickRival());
  }

  renderTextStream() {
    this.streamEl.innerHTML = '';
    const spanList = [];
    const len = this.text.length;
    const windowStart = Math.max(0, this.session.index - 5);
    const windowEnd = Math.min(len, windowStart + 16);

    for (let i = windowStart; i < windowEnd; i++) {
      const ch = this.text[i];
      const isSpace = ch === ' ';
      const span = document.createElement('span');
      span.className = `stone-char ${isSpace ? 'space' : ''}`;
      if (i < this.session.index) span.classList.add('completed');
      else if (i === this.session.index) span.classList.add('active');
      span.textContent = isSpace ? '␣' : ch;
      this.streamEl.appendChild(span);
      spanList.push(span);
    }
    this.activeSpan = spanList.find((s) => s.classList.contains('active'));
  }

  updateTarget() {
    if (this.destroyed || this.session.done) return;
    this.kbView.highlight(this.session.current);
    this.renderTextStream();

    const maxPx = this.racerPlayer.parentElement.clientWidth - 80;
    this.racerPlayer.style.left = `${this.session.progress * maxPx}px`;

    if (this.onProgress) {
      const st = this.session.stats();
      this.onProgress(this.session.progress, `${Math.round(st.wpm)} WPM (Goal: ${this.targetWpm})`);
    }
  }

  handleKey(rawKey) {
    if (this.destroyed || this.session.done) return;
    const ch = normalizeKey(rawKey);
    if (!ch) return;

    const res = this.session.press(ch);
    this.kbView.flashPress(ch);

    if (res.type === 'correct') {
      sfx.correct(res.streak);
      if (res.done) {
        this.finishRace();
      } else {
        this.updateTarget();
      }
    } else if (res.type === 'wrong') {
      sfx.wrong();
      if (this.activeSpan) fx.shake(this.activeSpan);
    }
  }

  finishRace() {
    cancelAnimationFrame(this.rivalAnim);
    this.kbView.clear();

    const won = this.session.progress >= this.rivalProgress;
    if (won) {
      sfx.fanfare();
      fx.confetti(60);
    } else {
      sfx.tryAgain();
    }

    const st = this.session.stats();
    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete({
          ...st,
          perKey: this.session.tracker.keys,
        });
      }
    }, 1600);
  }

  destroy() {
    cancelAnimationFrame(this.rivalAnim);
    super.destroy();
  }
}
