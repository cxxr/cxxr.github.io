import { TypingSession, normalizeKey } from './engine.js';
import { dinoSVG, eggSVG, nestSVG, meteorSVG, playBallSVG, butterflySVG } from './dino-art.js';
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
   Mode 2: Trail Mode (Dinos run and play together as you type!)
   ========================================================================== */
export class TrailMode extends ModeRunner {
  start() {
    this.text = typeof this.content === 'string' ? this.content : this.content.join(' ');
    this.session = new TypingSession(this.text);
    this.scrollPx = 0;
    this.energy = 0; // 0 to 100
    this.speedTier = 'idle';
    this.lastTypeTime = 0;
    this.ballTurn = 'right';

    // Pick a companion dinosaur friend to run and play with!
    const companionId = this.level.reward || (this.buddy.id === 'rexy' ? 'sunny' : (this.buddy.id === 'sunny' ? 'trixie' : 'rexy'));
    this.friendDino = getDino(companionId);

    this.stageEl.innerHTML = `
      <div class="trail-stage">
        <div class="speed-wind-lines" id="trail-wind"></div>
        <div class="dino-energy-gauge" id="dino-gauge">
          <div class="dino-energy-pill" id="dino-status">🐾 Walking</div>
          <div class="dino-energy-bar-wrap">
            <div class="dino-energy-bar-fill" id="dino-energy-fill"></div>
          </div>
          <div class="dino-streak-badge" id="dino-streak" style="display:none;">⚡ 0</div>
        </div>

        <div class="trail-play-area">
          <div class="trail-friend-wrap" id="trail-friend">
            ${dinoSVG(this.friendDino, { className: 'walking' })}
          </div>
          <div class="trail-ball-wrap" id="trail-ball">
            ${playBallSVG()}
          </div>
          <div class="trail-dino-wrap" id="trail-dino">
            ${dinoSVG(this.buddy, { className: 'walking' })}
          </div>
          <div class="trail-butterfly-wrap" id="trail-butterfly">
            ${butterflySVG()}
          </div>
        </div>

        <div class="text-stream" id="text-stream"></div>
      </div>
    `;

    this.dinoEl = this.stageEl.querySelector('#trail-dino');
    this.friendEl = this.stageEl.querySelector('#trail-friend');
    this.ballEl = this.stageEl.querySelector('#trail-ball');
    this.windEl = this.stageEl.querySelector('#trail-wind');
    this.gaugeEl = this.stageEl.querySelector('#dino-gauge');
    this.statusEl = this.stageEl.querySelector('#dino-status');
    this.energyFillEl = this.stageEl.querySelector('#dino-energy-fill');
    this.streakEl = this.stageEl.querySelector('#dino-streak');
    this.streamEl = this.stageEl.querySelector('#text-stream');

    this.dinoSvg = this.dinoEl?.querySelector('.dino');
    this.friendSvg = this.friendEl?.querySelector('.dino');

    this.renderTextStream();
    this.updateTarget();

    // Start energy & movement loop
    this.animLoop = requestAnimationFrame(() => this.tick());

    if (this.level.intro) {
      say(this.level.intro, { pitch: 1.25, rate: 0.95 });
    }
  }

  tick() {
    if (this.destroyed) return;
    const now = performance.now();
    const timeSinceType = now - this.lastTypeTime;

    // Smoothly decay energy when not typing
    if (timeSinceType > 700) {
      this.energy = Math.max(0, this.energy - 0.7);
    }

    this.updateEnergyVisuals();
    this.animLoop = requestAnimationFrame(() => this.tick());
  }

  updateEnergyVisuals() {
    if (this.energyFillEl) {
      this.energyFillEl.style.width = `${Math.min(100, Math.max(10, this.energy))}%`;
    }

    const streak = this.session.streak;
    if (this.streakEl) {
      if (streak >= 3) {
        this.streakEl.style.display = 'block';
        this.streakEl.textContent = `⚡ ${streak}`;
      } else {
        this.streakEl.style.display = 'none';
      }
    }

    // Determine speed state
    if (this.energy >= 55 || streak >= 10) {
      this.setSpeedTier('sprint');
    } else if (this.energy >= 22 || streak >= 4) {
      this.setSpeedTier('run');
    } else if (this.energy > 5) {
      this.setSpeedTier('walk');
    } else {
      this.setSpeedTier('idle');
    }
  }

  setSpeedTier(tier) {
    if (this.speedTier === tier) return;
    this.speedTier = tier;

    if (this.dinoSvg) {
      this.dinoSvg.classList.remove('idle-happy', 'walking', 'running', 'sprinting');
    }
    if (this.friendSvg) {
      this.friendSvg.classList.remove('idle-happy', 'walking', 'running', 'sprinting');
    }

    if (tier === 'sprint') {
      this.dinoSvg?.classList.add('sprinting');
      this.friendSvg?.classList.add('sprinting');
      this.windEl?.classList.add('active', 'sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill sprint';
      if (this.statusEl) this.statusEl.textContent = '🔥 SUPER SPRINT!';
      if (this.dinoEl) this.dinoEl.style.left = '32%';
      if (this.friendEl) this.friendEl.style.left = '16%';
    } else if (tier === 'run') {
      this.dinoSvg?.classList.add('running');
      this.friendSvg?.classList.add('running');
      this.windEl?.classList.add('active');
      this.windEl?.classList.remove('sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill run';
      if (this.statusEl) this.statusEl.textContent = '⚡ Running Fast!';
      if (this.dinoEl) this.dinoEl.style.left = '29%';
      if (this.friendEl) this.friendEl.style.left = '13%';
    } else if (tier === 'walk') {
      this.dinoSvg?.classList.add('walking');
      this.friendSvg?.classList.add('walking');
      this.windEl?.classList.remove('active', 'sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill';
      if (this.statusEl) this.statusEl.textContent = '🦖 Trotting';
      if (this.dinoEl) this.dinoEl.style.left = '26%';
      if (this.friendEl) this.friendEl.style.left = '10%';
    } else {
      this.dinoSvg?.classList.add('idle-happy');
      this.friendSvg?.classList.add('idle-happy');
      this.windEl?.classList.remove('active', 'sprint');
      if (this.energyFillEl) this.energyFillEl.className = 'dino-energy-bar-fill';
      if (this.statusEl) this.statusEl.textContent = '🐾 Ready to Play!';
      if (this.dinoEl) this.dinoEl.style.left = '26%';
      if (this.friendEl) this.friendEl.style.left = '10%';
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
      this.lastTypeTime = performance.now();
      this.energy = Math.min(100, this.energy + 16);
      this.updateEnergyVisuals();

      sfx.correct(res.streak);
      sfx.step();

      // Parallax scroll accelerates with energy!
      const scrollSpeed = this.energy > 55 ? 42 : (this.energy > 20 ? 32 : 22);
      this.scrollPx += scrollSpeed;
      this.sceneCtrl.scrollTo(this.scrollPx);

      // Footstep dust puffs for both buddy and companion friend!
      if (this.dinoEl) {
        const dRect = this.dinoEl.getBoundingClientRect();
        fx.dust(dRect.left + 50, dRect.bottom - 10);
      }
      if (this.friendEl && res.streak % 2 === 0) {
        const fRect = this.friendEl.getBoundingClientRect();
        fx.dust(fRect.left + 40, fRect.bottom - 10);
      }

      // Ball toss / bounce between the two dinos!
      if (this.ballEl) {
        this.ballEl.classList.remove('kick-left', 'kick-right', 'high-bounce');
        void this.ballEl.offsetWidth; // trigger reflow
        if (res.streak > 0 && res.streak % 5 === 0) {
          this.ballEl.classList.add('high-bounce');
        } else {
          this.ballTurn = this.ballTurn === 'right' ? 'left' : 'right';
          this.ballEl.classList.add(this.ballTurn === 'right' ? 'kick-right' : 'kick-left');
        }
      }

      // Playful tricks & somersaults on streak milestones!
      if (res.streak > 0 && res.streak % 5 === 0) {
        this.triggerPlayTrick(res.streak);
      }

      if (this.activeSpan && res.streak % 4 === 0) {
        const sRect = this.activeSpan.getBoundingClientRect();
        fx.starBurst(sRect.left + sRect.width / 2, sRect.top + sRect.height / 2, 6);
      }

      if (res.done) {
        this.finishTrail();
      } else {
        this.updateTarget();
      }
    } else if (res.type === 'wrong') {
      sfx.wrong();
      this.energy = Math.max(0, this.energy - 12);
      this.updateEnergyVisuals();
      if (this.activeSpan) fx.shake(this.activeSpan);
      say(`Tap ${spokenName(res.expected)}`, { pitch: 1.2, rate: 1.0 });
    }
  }

  triggerPlayTrick(streak) {
    // Lead dino does a high joyful leap or 360 flip!
    if (this.dinoSvg) {
      const trickClass = streak >= 10 && streak % 10 === 0 ? 'flip' : 'leaping';
      this.dinoSvg.classList.add(trickClass);
      setTimeout(() => this.dinoSvg?.classList.remove(trickClass), 750);
    }

    // Companion dino hops playfully!
    if (this.friendSvg) {
      setTimeout(() => {
        this.friendSvg?.classList.add('leaping');
        setTimeout(() => this.friendSvg?.classList.remove('leaping'), 650);
      }, 120);
    }

    // Star burst and celebratory roar
    if (this.dinoEl) {
      const r = this.dinoEl.getBoundingClientRect();
      fx.starBurst(r.left + r.width / 2, r.top + 20, 8);
    }
    sfx.roar();
  }

  finishTrail() {
    this.kbView.clear();
    cancelAnimationFrame(this.animLoop);
    this.dinoSvg?.classList.remove('walking', 'running', 'sprinting', 'idle-happy');
    this.friendSvg?.classList.remove('walking', 'running', 'sprinting', 'idle-happy');
    this.dinoSvg?.classList.add('celebrating', 'roaring');
    this.friendSvg?.classList.add('celebrating');

    sfx.fanfare();
    fx.confetti(60);

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

  destroy() {
    cancelAnimationFrame(this.animLoop);
    super.destroy();
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
