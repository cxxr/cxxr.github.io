// Main application coordinator for Dino Keys.
import { Store, totalStars } from './storage.js';
import { WORLDS, LEVELS, getLevel, poolFor, isUnlocked, currentLevel, starsFor, nextLevel, START_OPTIONS } from './curriculum.js';
import { buildContent, mulberry32 } from './textgen.js';
import { weightsFromKeyStats, trickyKeys } from './engine.js';
import { dinoSVG } from './dino-art.js';
import { DINOS, getDino, SPECIES_NAMES } from './dinos.js';
import { renderScene, renderStaticScenes } from './scene.js';
import { KeyboardView } from './keyboard-view.js';
import { HatchMode, TrailMode, MeteorMode, RaceMode } from './game-modes.js';
import { WorldMap } from './world-map.js';
import { KeyboardManager } from './keyboard-manager.js';
import { unlockAudio, configureAudio, startMusic, sfx, say } from './audio.js';
import { fx } from './fx.js';

class App {
  constructor() {
    this.store = new Store();
    this.activeMode = null;
    this.currentLevelId = null;

    this.initDOM();
    this.initKeyboard();
    this.initKeyboardManager();
    this.initEvents();
    this.setupInitialScreen();
  }

  initDOM() {
    this.screens = {
      title: document.getElementById('screen-title'),
      profiles: document.getElementById('screen-profiles'),
      newplayer: document.getElementById('screen-newplayer'),
      map: document.getElementById('screen-map'),
      game: document.getElementById('screen-game'),
      results: document.getElementById('screen-results'),
      collection: document.getElementById('screen-collection'),
      parents: document.getElementById('screen-parents'),
    };

    // Render title dino
    const titleDinoEl = document.getElementById('title-dino');
    if (titleDinoEl) {
      titleDinoEl.innerHTML = dinoSVG('rexy', { className: 'celebrating' });
    }

    renderStaticScenes();
  }

  initKeyboard() {
    this.kbView = new KeyboardView({
      kbEl: document.getElementById('keyboard'),
      leftHandEl: document.getElementById('hand-left'),
      rightHandEl: document.getElementById('hand-right'),
      hintEl: document.getElementById('finger-hint'),
      onKeyPress: (ch) => {
        if (this.activeMode) this.activeMode.handleKey(ch);
      },
    });
  }

  initKeyboardManager() {
    this.kbManager = new KeyboardManager({
      proxyInput: document.getElementById('mobile-text-proxy'),
      gameScreen: this.screens.game,
      toggleBtn: document.getElementById('btn-kb-mode'),
      focusHintEl: document.getElementById('mobile-focus-hint'),
      initialPreference: this.store.current?.settings?.keyboardMode || 'auto',
      onKey: (ch) => {
        if (this.activeMode) {
          this.activeMode.handleKey(ch);
        }
      },
      onModeChange: (mode, { autoDetected } = {}) => {
        if (autoDetected) {
          this.toast('💻 Hardware keyboard detected');
        } else {
          this.toast(mode === 'soft' ? '📱 Using Built-in Keyboard' : '💻 Using Hardware Keyboard');
        }
        if (this.store.current) {
          this.store.updateSettings({ keyboardMode: this.kbManager.preference });
        }
      },
    });
  }

  initEvents() {
    // Global user interaction listener to unlock Web Audio on iOS / iPadOS Safari
    const unlockOnGesture = () => {
      unlockAudio();
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('touchend', unlockOnGesture);
      window.removeEventListener('click', unlockOnGesture);
    };
    window.addEventListener('touchstart', unlockOnGesture, { passive: true });
    window.addEventListener('touchend', unlockOnGesture, { passive: true });
    window.addEventListener('click', unlockOnGesture, { passive: true });

    // Title screen start via space or enter
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen === 'title' && (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        this.handleStartPlay();
      }
    });

    // Navigation buttons
    const startBtn = document.getElementById('btn-start');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleStartPlay();
      });
      startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleStartPlay();
      });
    }
    document.getElementById('title-dino')?.addEventListener('click', () => this.handleStartPlay());
    document.getElementById('btn-quit')?.addEventListener('click', () => {
      sfx.click();
      this.showScreen('map');
    });
    document.getElementById('btn-collection')?.addEventListener('click', () => {
      sfx.click();
      this.renderCollection();
      this.showScreen('collection');
    });
    document.getElementById('map-buddy')?.addEventListener('click', () => {
      sfx.click();
      this.renderCollection();
      this.showScreen('collection');
    });
    document.getElementById('btn-switch')?.addEventListener('click', () => {
      sfx.click();
      this.renderProfiles();
      this.showScreen('profiles');
    });
    document.getElementById('btn-parents')?.addEventListener('click', () => {
      sfx.click();
      this.renderParents();
      this.showScreen('parents');
    });
    document.getElementById('btn-practice')?.addEventListener('click', () => {
      sfx.click();
      this.startPractice();
    });

    // Generic back button handler
    document.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.click();
        this.showScreen(btn.dataset.back);
      });
    });
  }

  showScreen(name) {
    this.currentScreen = name;
    if (this.kbManager) {
      this.kbManager.setGameActive(name === 'game');
    }
    if (this.activeMode && name !== 'game') {
      this.activeMode.destroy();
      this.activeMode = null;
    }

    Object.entries(this.screens).forEach(([id, el]) => {
      el.classList.toggle('active', id === name);
    });

    if (name === 'map') this.renderMap();
  }

  toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
  }

  setupInitialScreen() {
    this.showScreen('title');
  }

  handleStartPlay() {
    unlockAudio();
    sfx.click();

    const p = this.store.current;
    if (!p) {
      if (this.store.profiles.length > 0) {
        this.renderProfiles();
        this.showScreen('profiles');
      } else {
        this.renderNewPlayerForm();
        this.showScreen('newplayer');
      }
    } else {
      this.syncSettings();
      this.renderMap();
      this.showScreen('map');
    }
  }

  syncSettings() {
    const p = this.store.current;
    if (!p) return;
    configureAudio(p.settings);
    if (p.settings.music) startMusic();
    this.kbView.setVisible(p.settings.keyboard, p.settings.hands);
    if (this.kbManager && p.settings.keyboardMode) {
      this.kbManager.setPreference(p.settings.keyboardMode);
    }
  }

  /* ==========================================================================
     Profiles & New Player
     ========================================================================== */
  renderProfiles() {
    const listEl = document.getElementById('profile-list');
    listEl.innerHTML = '';

    for (const p of this.store.profiles) {
      const buddy = getDino(p.buddy);
      const stars = totalStars(p);
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.innerHTML = `
        <div class="profile-avatar">${dinoSVG(buddy)}</div>
        <div class="profile-name">${p.name}</div>
        <div class="profile-stars">⭐ ${stars}</div>
      `;
      card.addEventListener('click', () => {
        sfx.click();
        this.store.select(p.id);
        this.syncSettings();
        this.showScreen('map');
      });
      listEl.appendChild(card);
    }

    // Add Player card
    const addCard = document.createElement('div');
    addCard.className = 'profile-card';
    addCard.style.borderStyle = 'dashed';
    addCard.innerHTML = `
      <div style="font-size:3.5rem; margin: 10px 0;">🐣</div>
      <div class="profile-name" style="color:var(--green)">+ New Player</div>
    `;
    addCard.addEventListener('click', () => {
      sfx.click();
      this.renderNewPlayerForm();
      this.showScreen('newplayer');
    });
    listEl.appendChild(addCard);
  }

  renderNewPlayerForm() {
    const panel = document.getElementById('newplayer-panel');
    panel.innerHTML = `
      <h2>Welcome to Dino Keys!</h2>
      <p class="sub">Pick a name and starting spot:</p>
      <div style="margin: 18px 0;">
        <input type="text" id="np-name" placeholder="Child's Name" maxlength="14"
          style="font-size:1.4rem; padding:10px 20px; border-radius:999px; border:2px solid #ccc; font-family:inherit; text-align:center; width:min(280px,80vw);">
      </div>
      <div class="placement-options" id="np-options"></div>
      <div style="display:flex; justify-content:center; gap:14px; margin-top:20px;">
        ${this.store.profiles.length > 0 ? `<button class="btn" id="np-cancel">Cancel</button>` : ''}
        <button class="btn big primary" id="np-create">Start Adventure!</button>
      </div>
    `;

    let selectedWorld = 0;
    const optContainer = panel.querySelector('#np-options');
    START_OPTIONS.forEach((opt) => {
      const div = document.createElement('div');
      div.className = `placement-opt ${opt.world === selectedWorld ? 'selected' : ''}`;
      div.innerHTML = `
        <div class="placement-opt-head"><span>${opt.emoji}</span><span>${opt.title}</span></div>
        <div class="placement-opt-desc">${opt.desc}</div>
      `;
      div.addEventListener('click', () => {
        sfx.click();
        selectedWorld = opt.world;
        optContainer.querySelectorAll('.placement-opt').forEach((o) => o.classList.remove('selected'));
        div.classList.add('selected');
      });
      optContainer.appendChild(div);
    });

    const nameInput = panel.querySelector('#np-name');
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        panel.querySelector('#np-create')?.click();
      }
    });
    setTimeout(() => nameInput?.focus(), 100);

    panel.querySelector('#np-create').addEventListener('click', () => {
      const name = panel.querySelector('#np-name').value.trim() || 'Little Dino';
      this.store.createProfile({ name, startWorld: selectedWorld });
      this.syncSettings();
      this.showScreen('map');
      say(`Welcome to Dino Keys, ${name}!`);
    });

    panel.querySelector('#np-cancel')?.addEventListener('click', () => {
      sfx.click();
      this.renderProfiles();
      this.showScreen('profiles');
    });
  }

  /* ==========================================================================
     World Map Screen
     ========================================================================== */
  renderMap() {
    const p = this.store.current;
    if (!p) return;

    const buddy = getDino(p.buddy);
    const buddyBtn = document.getElementById('map-buddy');
    buddyBtn.innerHTML = `
      <div class="buddy-chip-avatar">${dinoSVG(buddy)}</div>
      <span>${buddy.name}</span>
    `;

    document.getElementById('map-player').textContent = p.name;
    document.getElementById('map-stars').textContent = `⭐ ${totalStars(p)}`;

    const scrollEl = document.getElementById('map-scroll');
    if (this.worldMap) {
      this.worldMap.destroy();
    }
    this.worldMap = new WorldMap({
      container: scrollEl,
      store: this.store,
      onSelectLevel: (lvlId) => {
        this.startLevel(lvlId);
      },
    });
    this.worldMap.render();
  }

  /* ==========================================================================
     Start Level & Gameplay
     ========================================================================== */
  startLevel(levelId) {
    const level = getLevel(levelId);
    if (!level) return;
    this.currentLevelId = levelId;

    const p = this.store.current;
    const pool = poolFor(levelId);
    const weights = weightsFromKeyStats(p.keyStats);
    const content = buildContent(level, pool, { rng: mulberry32(Date.now()), weights });

    this.showScreen('game');

    // Setup themed scene
    const sceneHost = document.getElementById('game-scene');
    sceneHost.innerHTML = '';
    const sceneCtrl = renderScene(sceneHost, level.worldId);

    // Setup HUD
    document.getElementById('hud-title').textContent = `${level.title}`;
    const fill = document.getElementById('hud-progress');
    fill.style.width = '0%';
    const statPill = document.getElementById('hud-stat');
    statPill.textContent = '';

    const stageEl = document.getElementById('stage');

    const commonOpts = {
      stageEl,
      sceneCtrl,
      kbView: this.kbView,
      level,
      pool,
      content,
      buddy: p.buddy,
      onProgress: (ratio, statText) => {
        fill.style.width = `${Math.round(ratio * 100)}%`;
        if (statText) statPill.textContent = statText;
      },
      onComplete: (stats) => this.handleLevelComplete(level, stats),
    };

    switch (level.mode) {
      case 'hatch':
        this.activeMode = new HatchMode(commonOpts);
        break;
      case 'trail':
        this.activeMode = new TrailMode(commonOpts);
        break;
      case 'meteor':
        this.activeMode = new MeteorMode(commonOpts);
        break;
      case 'race':
        this.activeMode = new RaceMode(commonOpts);
        break;
      default:
        console.error('Unknown mode', level.mode);
        return;
    }

    this.activeMode.start();
    if (this.kbManager) {
      this.kbManager.setGameActive(true);
    }
  }

  startPractice() {
    const p = this.store.current;
    if (!p) return;
    const tricky = trickyKeys(p.keyStats, 5);

    // Create custom practice drill
    const practiceLevel = {
      id: 'practice',
      title: 'Tricky Keys Practice 🎯',
      worldId: 'meadow',
      mode: 'trail',
      newKeys: tricky.length ? tricky : ['f', 'j', 'd', 'k'],
      length: 28,
      minAcc: 60,
      intro: tricky.length
        ? `Let's practice your tricky keys: ${tricky.map(capLabel).join(', ')}!`
        : 'Nice and easy practice on the home row!',
    };

    this.currentLevelId = 'practice';
    const pool = tricky.length ? [...new Set([...tricky, ' '])] : ['f', 'j', 'd', 'k', ' '];
    const content = buildContent(
      { content: 'drill', length: 28, newKeys: tricky },
      pool,
      { rng: mulberry32(Date.now()), weights: weightsFromKeyStats(p.keyStats) }
    );

    this.showScreen('game');
    const sceneHost = document.getElementById('game-scene');
    sceneHost.innerHTML = '';
    const sceneCtrl = renderScene(sceneHost, 'meadow');

    document.getElementById('hud-title').textContent = practiceLevel.title;
    const fill = document.getElementById('hud-progress');
    fill.style.width = '0%';
    const statPill = document.getElementById('hud-stat');
    statPill.textContent = '';

    this.activeMode = new TrailMode({
      stageEl: document.getElementById('stage'),
      sceneCtrl,
      kbView: this.kbView,
      level: practiceLevel,
      pool,
      content,
      buddy: p.buddy,
      onProgress: (ratio, statText) => {
        fill.style.width = `${Math.round(ratio * 100)}%`;
        if (statText) statPill.textContent = statText;
      },
      onComplete: (stats) => {
        this.store.recordPractice({ stats, perKey: stats.perKey });
        this.showResultsPanel(practiceLevel, 3, stats, { newDino: null });
      },
    });

    this.activeMode.start();
  }

  /* ==========================================================================
     Level Complete & Results Screen
     ========================================================================== */
  handleLevelComplete(level, stats) {
    const stars = starsFor(level, stats);
    let record = { firstClear: false, newBest: false, newDino: null };

    if (level.id !== 'practice') {
      record = this.store.recordResult(level.id, {
        stars,
        stats,
        perKey: stats.perKey || {},
      });
    }

    this.showResultsPanel(level, stars, stats, record);
  }

  showResultsPanel(level, stars, stats, record) {
    this.showScreen('results');

    // Background scene for results
    const sceneHost = document.getElementById('results-scene');
    sceneHost.innerHTML = '';
    renderScene(sceneHost, level.worldId || 'meadow', { drift: true });

    const p = this.store.current;
    const nxt = nextLevel(level.id);

    const panel = document.getElementById('results-panel');
    const newDino = record.newDino ? getDino(record.newDino) : null;

    panel.innerHTML = `
      <h2>${stars > 0 ? 'Awesome Job! 🌟' : 'Good Try!'}</h2>
      <div class="results-stars" id="res-stars">
        <span class="results-star" id="star-1">⭐</span>
        <span class="results-star" id="star-2">⭐</span>
        <span class="results-star" id="star-3">⭐</span>
      </div>

      ${
        newDino
          ? `
        <div class="reward-banner">
          <div class="reward-dino-wrap">${dinoSVG(newDino, { className: 'celebrating' })}</div>
          <div style="text-align:left;">
            <div style="font-size:1.35rem; font-weight:700;">Hatched ${newDino.name}!</div>
            <div style="font-size:0.95rem; color:#6d4c41;">A friendly ${SPECIES_NAMES[newDino.species]} joined you!</div>
          </div>
        </div>
      `
          : ''
      }

      <div class="results-stats">
        <div class="stat-box"><div class="stat-val">${Math.round(stats.accuracy)}%</div><div class="stat-lbl">Accuracy</div></div>
        <div class="stat-box"><div class="stat-val">${Math.round(stats.wpm)}</div><div class="stat-lbl">Words/Min</div></div>
        <div class="stat-box"><div class="stat-val">${stats.bestStreak || stats.chars || 0}</div><div class="stat-lbl">Best Streak</div></div>
      </div>

      <div class="results-actions">
        <button class="btn" id="res-map">🗺️ World Map</button>
        <button class="btn" id="res-retry">🔄 Try Again</button>
        ${
          nxt && stars > 0
            ? `<button class="btn primary big" id="res-next" style="padding:14px 34px; font-size:1.35rem;">▶ Next Level</button>`
            : ''
        }
      </div>
    `;

    // Star pop-in animation with musical chimes
    for (let i = 1; i <= 3; i++) {
      const starEl = panel.querySelector(`#star-${i}`);
      if (i <= stars) {
        setTimeout(() => {
          starEl.classList.add('show');
          sfx.star(i - 1);
          const r = starEl.getBoundingClientRect();
          fx.starBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
        }, i * 360);
      } else {
        starEl.style.opacity = '0.2';
        starEl.style.transform = 'scale(0.8)';
      }
    }

    if (stars > 0) {
      setTimeout(() => sfx.fanfare(), 1200);
    } else {
      setTimeout(() => sfx.tryAgain(), 500);
    }

    panel.querySelector('#res-map').addEventListener('click', () => {
      sfx.click();
      this.showScreen('map');
    });
    panel.querySelector('#res-retry').addEventListener('click', () => {
      sfx.click();
      this.startLevel(level.id);
    });
    panel.querySelector('#res-next')?.addEventListener('click', () => {
      sfx.click();
      this.startLevel(nxt.id);
    });
  }

  /* ==========================================================================
     Dino Collection Screen
     ========================================================================== */
  renderCollection() {
    const p = this.store.current;
    if (!p) return;

    const grid = document.getElementById('dino-grid');
    grid.innerHTML = '';

    DINOS.forEach((d) => {
      const unlocked = p.dinos.includes(d.id);
      const isBuddy = p.buddy === d.id;

      const card = document.createElement('div');
      card.className = `dino-card ${unlocked ? '' : 'locked'} ${isBuddy ? 'is-buddy' : ''}`;
      card.innerHTML = `
        <div class="dino-card-art">${dinoSVG(d, { className: isBuddy ? 'celebrating' : '' })}</div>
        <div class="dino-card-name">${unlocked ? d.name : '???'}</div>
        <div class="dino-card-species">${SPECIES_NAMES[d.species]}</div>
        ${isBuddy ? `<div class="dino-buddy-tag">Buddy!</div>` : ''}
      `;

      if (unlocked) {
        card.addEventListener('click', () => {
          sfx.roar();
          this.store.setBuddy(d.id);
          this.toast(`${d.name} is now your buddy! 🦖`);
          this.renderCollection();
        });
      }

      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     Parent Dashboard / Settings
     ========================================================================== */
  renderParents() {
    const p = this.store.current;
    if (!p) return;

    const panel = document.getElementById('parents-panel');
    const tricky = trickyKeys(p.keyStats, 8);
    const minutes = Math.round((p.totals.ms || 0) / 60000);

    panel.innerHTML = `
      <div class="panel-head">
        <button class="btn small icon" data-back="map">⬅</button>
        <h2>Grown-ups & Settings</h2>
      </div>
      <p class="sub">Progress summary for <strong>${p.name}</strong></p>

      <div class="results-stats">
        <div class="stat-box"><div class="stat-val">${p.totals.plays || 0}</div><div class="stat-lbl">Sessions Played</div></div>
        <div class="stat-box"><div class="stat-val">${p.totals.chars || 0}</div><div class="stat-lbl">Keys Typed</div></div>
        <div class="stat-box"><div class="stat-val">${minutes}m</div><div class="stat-lbl">Time Practiced</div></div>
        <div class="stat-box"><div class="stat-val">${p.dinos.length} / ${DINOS.length}</div><div class="stat-lbl">Dinos Found</div></div>
      </div>

      <div class="settings-group">
        <h3>Keys to Practice</h3>
        ${
          tricky.length
            ? `<div class="tricky-keys-wrap">${tricky.map((k) => `<span class="tricky-pill">${capLabel(k)}</span>`).join('')}</div>`
            : `<p style="margin:0; color:var(--ink-soft);">No tricky keys yet! Everything looks great.</p>`
        }
      </div>

      <div class="settings-group">
        <h3>Audio & Voice</h3>
        <div class="settings-row">
          <span>Sound Effects</span>
          <label class="switch"><input type="checkbox" id="set-sound" ${p.settings.sound ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Spoken Voice Prompts</span>
          <label class="switch"><input type="checkbox" id="set-voice" ${p.settings.voice ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Background Music</span>
          <label class="switch"><input type="checkbox" id="set-music" ${p.settings.music ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>

      <div class="settings-group">
        <h3>Display & Helpers</h3>
        <div class="settings-row">
          <span>On-screen Keyboard</span>
          <label class="switch"><input type="checkbox" id="set-kb" ${p.settings.keyboard ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Finger Guide Hands</span>
          <label class="switch"><input type="checkbox" id="set-hands" ${p.settings.hands ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>Keyboard Input Mode</span>
          <select id="set-kb-mode" style="font-family:inherit; font-size:1rem; padding:4px 8px; border-radius:8px; border:2px solid #ccc; background:#fff; color:var(--ink);">
            <option value="auto" ${p.settings.keyboardMode === 'auto' ? 'selected' : ''}>Auto (Smart Detect)</option>
            <option value="soft" ${p.settings.keyboardMode === 'soft' ? 'selected' : ''}>Built-in Device Keyboard</option>
            <option value="hardware" ${p.settings.keyboardMode === 'hardware' ? 'selected' : ''}>Hardware Keyboard</option>
          </select>
        </div>
        <div class="settings-row">
          <span>Unlock All Levels (Skip Ahead)</span>
          <label class="switch"><input type="checkbox" id="set-unlock" ${p.settings.unlockAll ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
        <button class="btn danger small" id="btn-reset">Reset Player Progress</button>
        <button class="btn primary" data-back="map">Done</button>
      </div>
    `;

    // Bind toggles
    const bindToggle = (id, key) => {
      panel.querySelector(`#${id}`).addEventListener('change', (e) => {
        this.store.updateSettings({ [key]: e.target.checked });
        this.syncSettings();
      });
    };
    bindToggle('set-sound', 'sound');
    bindToggle('set-voice', 'voice');
    bindToggle('set-music', 'music');
    bindToggle('set-kb', 'keyboard');
    bindToggle('set-hands', 'hands');
    bindToggle('set-unlock', 'unlockAll');

    panel.querySelector('#set-kb-mode')?.addEventListener('change', (e) => {
      this.store.updateSettings({ keyboardMode: e.target.value });
      if (this.kbManager) {
        this.kbManager.setPreference(e.target.value);
      }
    });

    // Reset button
    panel.querySelector('#btn-reset').addEventListener('click', () => {
      if (confirm(`Reset all progress for ${p.name}? This will clear completed levels.`)) {
        this.store.resetProgress();
        this.toast('Progress reset.');
        this.renderParents();
      }
    });

    panel.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.click();
        this.showScreen(btn.dataset.back);
      });
    });
  }
}

// Start app on load
function startApp() {
  if (!window.dinoApp) {
    try {
      window.dinoApp = new App();
    } catch (err) {
      console.error('Failed to initialize Dino Keys App:', err);
    }
  }
}

if (document.getElementById('screen-title')) {
  startApp();
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
window.addEventListener('load', startApp);
