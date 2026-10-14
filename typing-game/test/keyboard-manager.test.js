import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectDeviceCapabilities, KeyboardManager } from '../js/keyboard-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Helper mock elements for headless testing
function createMockElement(tag = 'div') {
  const classes = new Set();
  const attributes = {};
  const listeners = {};
  return {
    tagName: tag.toUpperCase(),
    value: '',
    innerHTML: '',
    title: '',
    style: {},
    classList: {
      add: (cls) => classes.add(cls),
      remove: (cls) => classes.delete(cls),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (classes.has(cls)) classes.delete(cls); else classes.add(cls);
        } else if (force) {
          classes.add(cls);
        } else {
          classes.delete(cls);
        }
      },
      contains: (cls) => classes.has(cls),
    },
    setAttribute: (k, v) => { attributes[k] = v; },
    getAttribute: (k) => attributes[k] || null,
    addEventListener: (ev, fn) => {
      listeners[ev] = listeners[ev] || [];
      listeners[ev].push(fn);
    },
    removeEventListener: (ev, fn) => {
      if (!listeners[ev]) return;
      listeners[ev] = listeners[ev].filter((f) => f !== fn);
    },
    dispatchMockEvent: (ev, eventObj = {}) => {
      if (!listeners[ev]) return;
      listeners[ev].forEach((fn) => fn(eventObj));
    },
    focusCalls: 0,
    blurCalls: 0,
    focus: function () { this.focusCalls++; },
    blur: function () { this.blurCalls++; },
    closest: () => null,
  };
}

test('detectDeviceCapabilities correctly identifies desktop hardware keyboard setups', () => {
  const desktop = detectDeviceCapabilities({
    nav: { maxTouchPoints: 0, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    win: { matchMedia: (q) => ({ matches: q.includes('pointer: fine') }) },
  });
  assert.equal(desktop.isTouchDevice, false);
  assert.equal(desktop.hasFinePointer, true);
  assert.equal(desktop.defaultMode, 'hardware');
});

test('detectDeviceCapabilities correctly identifies mobile iPad and Android touch devices without hardware keyboard', () => {
  const iPad = detectDeviceCapabilities({
    nav: { maxTouchPoints: 5, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' },
    win: { matchMedia: () => ({ matches: false }) },
  });
  assert.equal(iPad.isAppleMobile, true);
  assert.equal(iPad.hasFinePointer, false);
  assert.equal(iPad.defaultMode, 'soft');

  const android = detectDeviceCapabilities({
    nav: { maxTouchPoints: 5, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet)' },
    win: { matchMedia: () => ({ matches: false }) },
  });
  assert.equal(android.isAndroid, true);
  assert.equal(android.hasFinePointer, false);
  assert.equal(android.defaultMode, 'soft');
});

test('detectDeviceCapabilities prefers hardware keyboard when iPad has fine pointer trackpad/keyboard', () => {
  const iPadWithMagicKeyboard = detectDeviceCapabilities({
    nav: { maxTouchPoints: 5, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' },
    win: { matchMedia: (q) => ({ matches: q.includes('pointer: fine') }) },
  });
  assert.equal(iPadWithMagicKeyboard.hasFinePointer, true);
  assert.equal(iPadWithMagicKeyboard.defaultMode, 'hardware');
});

test('KeyboardManager applies soft keyboard mode UI and hides onscreen keyboard class', () => {
  const proxyInput = createMockElement('input');
  const gameScreen = createMockElement('section');
  const toggleBtn = createMockElement('button');
  const keysReceived = [];

  const km = new KeyboardManager({
    proxyInput,
    gameScreen,
    toggleBtn,
    initialPreference: 'soft',
    capabilities: { defaultMode: 'soft' },
    onKey: (k) => keysReceived.push(k),
  });

  assert.equal(km.mode, 'soft');
  assert.equal(gameScreen.classList.contains('mobile-soft-kb-active'), true);
  assert.equal(toggleBtn.classList.contains('active-soft'), true);
  assert.ok(toggleBtn.innerHTML.includes('Built-in'));

  // When game becomes active in soft mode, proxyInput is focused
  km.setGameActive(true);
  assert.equal(proxyInput.focusCalls, 1);

  km.destroy();
});

test('KeyboardManager applies hardware keyboard mode and blurs proxy input', () => {
  const proxyInput = createMockElement('input');
  const gameScreen = createMockElement('section');
  const toggleBtn = createMockElement('button');

  const km = new KeyboardManager({
    proxyInput,
    gameScreen,
    toggleBtn,
    initialPreference: 'hardware',
    capabilities: { defaultMode: 'hardware' },
  });

  assert.equal(km.mode, 'hardware');
  assert.equal(gameScreen.classList.contains('mobile-soft-kb-active'), false);
  assert.equal(toggleBtn.classList.contains('active-soft'), false);
  assert.ok(toggleBtn.innerHTML.includes('Hardware'));

  km.setGameActive(true);
  // Should NOT focus proxyInput in hardware mode
  assert.equal(proxyInput.focusCalls, 0);

  km.destroy();
});

test('KeyboardManager toggleMode switches between soft and hardware keyboards', () => {
  const proxyInput = createMockElement('input');
  const gameScreen = createMockElement('section');
  const toggleBtn = createMockElement('button');

  const km = new KeyboardManager({
    proxyInput,
    gameScreen,
    toggleBtn,
    initialPreference: 'soft',
  });

  assert.equal(km.mode, 'soft');
  km.toggleMode();
  assert.equal(km.mode, 'hardware');
  assert.equal(gameScreen.classList.contains('mobile-soft-kb-active'), false);

  km.toggleMode();
  assert.equal(km.mode, 'soft');
  assert.equal(gameScreen.classList.contains('mobile-soft-kb-active'), true);

  km.destroy();
});

test('KeyboardManager captures and deduplicates soft keyboard input events', () => {
  const proxyInput = createMockElement('input');
  const gameScreen = createMockElement('section');
  const keys = [];

  const km = new KeyboardManager({
    proxyInput,
    gameScreen,
    initialPreference: 'soft',
    onKey: (k) => keys.push(k),
  });

  km.setGameActive(true);

  // Simulate soft keyboard typing 'd'
  proxyInput.dispatchMockEvent('keydown', { key: 'd', preventDefault: () => {} });
  // Simulate concurrent beforeinput for the same 'd' (common on iOS)
  proxyInput.dispatchMockEvent('beforeinput', { data: 'd', preventDefault: () => {} });

  assert.deepEqual(keys, ['d'], 'Identical duplicate keystrokes must be deduplicated');

  // Backspace event
  proxyInput.dispatchMockEvent('keydown', { key: 'Backspace', preventDefault: () => {} });
  assert.equal(keys[1], 'Backspace');

  // Space event
  proxyInput.dispatchMockEvent('keydown', { key: ' ', preventDefault: () => {} });
  assert.equal(keys[2], ' ');

  km.destroy();
});

test('index.html contains mobile keyboard proxy and HUD keyboard mode button', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.ok(html.includes('id="mobile-text-proxy"'), 'Must have mobile proxy input');
  assert.ok(html.includes('class="mobile-keyboard-proxy"'), 'Proxy must have mobile-keyboard-proxy class');
  assert.ok(html.includes('id="btn-kb-mode"'), 'Must have HUD keyboard mode toggle button');
  assert.ok(html.includes('class="mobile-focus-hint"'), 'Must have mobile focus hint element');
});

test('style.css defines font-size 16px to prevent iOS Safari auto-zoom and hides onscreen keyboard in soft mode', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');

  assert.ok(css.includes('.mobile-keyboard-proxy'), 'Must define .mobile-keyboard-proxy');
  assert.ok(css.includes('font-size: 16px'), 'Proxy must have font-size 16px to prevent iOS auto-zoom');
  assert.ok(
    css.includes('#screen-game.mobile-soft-kb-active .kb-area .keyboard'),
    'Must hide custom on-screen keyboard when mobile-soft-kb-active'
  );
  assert.ok(css.includes('display: none !important'), 'Soft keyboard active rule must set display: none !important');
});
