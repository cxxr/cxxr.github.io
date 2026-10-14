// Keyboard & Input Manager for Dino Keys.
// Handles automatic detection of mobile touch devices vs hardware keyboards,
// manages the invisible input proxy for native mobile keyboards,
// and supports seamless switching between built-in and hardware keyboards.

export function detectDeviceCapabilities({ nav = (typeof navigator !== 'undefined' ? navigator : {}), win = (typeof window !== 'undefined' ? window : {}) } = {}) {
  const isTouchDevice = Boolean(
    ('ontouchstart' in win) ||
    (nav.maxTouchPoints && nav.maxTouchPoints > 0)
  );

  const hasFinePointer = Boolean(
    win.matchMedia &&
    win.matchMedia('(hover: hover) and (pointer: fine)').matches
  );

  const ua = nav.userAgent || '';
  const isAppleMobile = /(iPad|iPhone|iPod)/i.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isAppleMobile || isAndroid || (isTouchDevice && !hasFinePointer);

  // If mobile touch device without fine pointer, default to soft keyboard.
  // If desktop/laptop (with fine pointer & hover), default to hardware keyboard.
  const defaultMode = (isMobile && !hasFinePointer) ? 'soft' : 'hardware';

  return {
    isTouchDevice,
    hasFinePointer,
    isAppleMobile,
    isAndroid,
    isMobile,
    defaultMode,
  };
}

export class KeyboardManager {
  constructor({
    proxyInput,
    gameScreen,
    toggleBtn,
    focusHintEl,
    onKey,
    onModeChange,
    initialPreference = 'auto',
    capabilities = null,
  } = {}) {
    this.proxyInput = proxyInput;
    this.gameScreen = gameScreen;
    this.toggleBtn = toggleBtn;
    this.focusHintEl = focusHintEl;
    this.onKey = onKey;
    this.onModeChange = onModeChange;

    this.capabilities = capabilities || detectDeviceCapabilities();
    this.preference = initialPreference || 'auto'; // 'auto' | 'soft' | 'hardware'
    this.mode = this.resolveMode(this.preference);

    this.lastHandledKey = null;
    this.lastHandledTime = 0;
    this.isGameActive = false;

    this.boundWindowKeyDown = this.handleWindowKeyDown.bind(this);
    this.boundProxyKeyDown = this.handleProxyKeyDown.bind(this);
    this.boundProxyBeforeInput = this.handleProxyBeforeInput.bind(this);
    this.boundProxyInput = this.handleProxyInput.bind(this);
    this.boundProxyFocus = this.handleProxyFocus.bind(this);
    this.boundProxyBlur = this.handleProxyBlur.bind(this);
    this.boundToggleClick = this.handleToggleClick.bind(this);
    this.boundScreenTap = this.handleScreenTap.bind(this);

    this.initEvents();
    this.applyModeUI();
  }

  resolveMode(pref) {
    if (pref === 'soft' || pref === 'hardware') {
      return pref;
    }
    return this.capabilities.defaultMode;
  }

  initEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundWindowKeyDown);
    }

    if (this.proxyInput) {
      this.proxyInput.addEventListener('keydown', this.boundProxyKeyDown);
      this.proxyInput.addEventListener('beforeinput', this.boundProxyBeforeInput);
      this.proxyInput.addEventListener('input', this.boundProxyInput);
      this.proxyInput.addEventListener('focus', this.boundProxyFocus);
      this.proxyInput.addEventListener('blur', this.boundProxyBlur);
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', this.boundToggleClick);
    }

    if (this.gameScreen) {
      this.gameScreen.addEventListener('click', this.boundScreenTap);
      this.gameScreen.addEventListener('touchend', this.boundScreenTap);
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundWindowKeyDown);
    }
    if (this.proxyInput) {
      this.proxyInput.removeEventListener('keydown', this.boundProxyKeyDown);
      this.proxyInput.removeEventListener('beforeinput', this.boundProxyBeforeInput);
      this.proxyInput.removeEventListener('input', this.boundProxyInput);
      this.proxyInput.removeEventListener('focus', this.boundProxyFocus);
      this.proxyInput.removeEventListener('blur', this.boundProxyBlur);
    }
    if (this.toggleBtn) {
      this.toggleBtn.removeEventListener('click', this.boundToggleClick);
    }
    if (this.gameScreen) {
      this.gameScreen.removeEventListener('click', this.boundScreenTap);
      this.gameScreen.removeEventListener('touchend', this.boundScreenTap);
    }
  }

  setGameActive(active) {
    this.isGameActive = Boolean(active);
    if (this.isGameActive && this.mode === 'soft') {
      this.focusProxy();
    } else if (!this.isGameActive) {
      this.blurProxy();
      this.hideFocusHint();
    }
  }

  setPreference(pref) {
    this.preference = pref || 'auto';
    const newMode = this.resolveMode(this.preference);
    this.setMode(newMode);
  }

  setMode(newMode, { autoDetected = false } = {}) {
    if (this.mode === newMode && !autoDetected) return;
    this.mode = newMode;
    this.applyModeUI();

    if (this.mode === 'soft' && this.isGameActive) {
      this.focusProxy();
    } else if (this.mode === 'hardware') {
      this.blurProxy();
      this.hideFocusHint();
    }

    if (this.onModeChange) {
      this.onModeChange(this.mode, { autoDetected });
    }
  }

  toggleMode() {
    const next = this.mode === 'soft' ? 'hardware' : 'soft';
    this.preference = next;
    this.setMode(next);
    return next;
  }

  applyModeUI() {
    if (this.gameScreen) {
      this.gameScreen.classList.toggle('mobile-soft-kb-active', this.mode === 'soft');
    }

    if (this.toggleBtn) {
      if (this.mode === 'soft') {
        this.toggleBtn.innerHTML = '📱 <span class="kb-mode-lbl">Built-in</span>';
        this.toggleBtn.title = 'Using Built-in Keyboard. Tap to switch to Hardware Keyboard';
        this.toggleBtn.setAttribute('aria-label', 'Using Built-in Keyboard. Tap to switch to Hardware Keyboard');
        this.toggleBtn.classList.add('active-soft');
      } else {
        this.toggleBtn.innerHTML = '💻 <span class="kb-mode-lbl">Hardware</span>';
        this.toggleBtn.title = 'Using Hardware Keyboard. Tap to switch to Built-in Keyboard';
        this.toggleBtn.setAttribute('aria-label', 'Using Hardware Keyboard. Tap to switch to Built-in Keyboard');
        this.toggleBtn.classList.remove('active-soft');
      }
    }
  }

  focusProxy() {
    if (!this.proxyInput || this.mode !== 'soft') return;
    try {
      this.proxyInput.focus({ preventScroll: true });
    } catch {
      this.proxyInput.focus();
    }
  }

  blurProxy() {
    if (!this.proxyInput) return;
    this.proxyInput.blur();
  }

  showFocusHint() {
    if (this.focusHintEl && this.isGameActive && this.mode === 'soft') {
      this.focusHintEl.style.display = 'flex';
    }
  }

  hideFocusHint() {
    if (this.focusHintEl) {
      this.focusHintEl.style.display = 'none';
    }
  }

  handleProxyFocus() {
    this.hideFocusHint();
  }

  handleProxyBlur() {
    if (this.isGameActive && this.mode === 'soft') {
      this.showFocusHint();
    }
  }

  handleScreenTap(e) {
    if (!this.isGameActive || this.mode !== 'soft') return;
    // Avoid refocusing if user is clicking a button (e.g. quit button, hud toggle)
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.hud')) {
      return;
    }
    this.focusProxy();
  }

  handleToggleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggleMode();
  }

  emitKey(ch) {
    if (!ch) return;
    const now = Date.now();
    // Deduplicate identical keystrokes fired in rapid succession (e.g. keydown + beforeinput)
    if (this.lastHandledKey === ch && (now - this.lastHandledTime) < 50) {
      return;
    }
    this.lastHandledKey = ch;
    this.lastHandledTime = now;

    if (this.onKey) {
      this.onKey(ch);
    }
  }

  handleProxyKeyDown(e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.emitKey('Backspace');
      if (this.proxyInput) this.proxyInput.value = '';
      return;
    }
    if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
      e.preventDefault();
      this.emitKey(' ');
      if (this.proxyInput) this.proxyInput.value = '';
      return;
    }
    if (e.key && e.key.length === 1 && e.key !== 'Unidentified') {
      e.preventDefault();
      this.emitKey(e.key);
      if (this.proxyInput) this.proxyInput.value = '';
    }
  }

  handleProxyBeforeInput(e) {
    if (e.inputType === 'deleteContentBackward') {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.emitKey('Backspace');
      if (this.proxyInput) this.proxyInput.value = '';
      return;
    }
    if (e.data) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      for (const ch of e.data) {
        this.emitKey(ch);
      }
      if (this.proxyInput) this.proxyInput.value = '';
    }
  }

  handleProxyInput() {
    if (!this.proxyInput) return;
    const val = this.proxyInput.value;
    if (val) {
      this.proxyInput.value = '';
      for (const ch of val) {
        this.emitKey(ch);
      }
    }
  }

  handleWindowKeyDown(e) {
    // If typing in another normal input field (like player name form), skip
    if (e.target && e.target !== document.body && e.target !== this.proxyInput && e.target.tagName === 'INPUT') {
      return;
    }

    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Detect physical keyboard keystroke
    if (e.target !== this.proxyInput) {
      if (this.mode === 'soft' && this.preference === 'auto') {
        // Automatically switch to hardware keyboard mode
        this.setMode('hardware', { autoDetected: true });
      }
    }

    // In hardware mode during gameplay, process the keystroke
    if (this.mode === 'hardware' && this.isGameActive) {
      if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
        e.preventDefault();
        this.emitKey(' ');
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        this.emitKey('Backspace');
        return;
      }
      if (e.key && e.key.length === 1) {
        e.preventDefault();
        this.emitKey(e.key);
      }
    }
  }
}
