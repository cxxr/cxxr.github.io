import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('PWA manifest exists, parses, and defines required fields for iPad and Android', () => {
  const manifestPath = path.join(rootDir, 'manifest.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');

  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  assert.equal(manifest.name, 'Dino Keys – Touch Typing for Kids');
  assert.equal(manifest.short_name, 'Dino Keys');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  assert.equal(manifest.theme_color, '#7bd389');
  assert.equal(manifest.background_color, '#7bd389');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 4);

  // Verify icon files referenced in manifest exist on disk
  manifest.icons.forEach((ic) => {
    const iconFilePath = path.join(rootDir, ic.src);
    assert.ok(fs.existsSync(iconFilePath), `Icon file ${ic.src} must exist on disk`);
  });
});

test('iPadOS touch icons exist in all required sizes', () => {
  const appleSizes = ['icon-180.png', 'icon-167.png', 'icon-152.png', 'icon-192.png', 'icon-512.png'];
  appleSizes.forEach((file) => {
    const p = path.join(rootDir, 'icons', file);
    assert.ok(fs.existsSync(p), `Apple touch icon ${file} must exist`);
    assert.ok(fs.statSync(p).size > 1000, `Icon ${file} must not be empty`);
  });
});

test('Service Worker sw.js exists, has valid syntax, and precaches core assets', () => {
  const swPath = path.join(rootDir, 'sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js must exist');

  const swCode = fs.readFileSync(swPath, 'utf8');
  assert.doesNotThrow(() => new Function(swCode), 'sw.js must be syntactically valid');

  assert.ok(swCode.includes('PRECACHE_ASSETS'), 'sw.js defines PRECACHE_ASSETS');
  assert.ok(swCode.includes('caches.open'), 'sw.js opens caches');
  assert.ok(swCode.includes('self.skipWaiting'), 'sw.js enables skipWaiting');
  assert.ok(swCode.includes('self.clients.claim'), 'sw.js claims clients');
});

test('index.html contains all Apple and PWA meta tags and install modal', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('rel="manifest"'), 'Links to manifest');
  assert.ok(html.includes('name="apple-mobile-web-app-capable" content="yes"'), 'apple-mobile-web-app-capable');
  assert.ok(html.includes('name="apple-mobile-web-app-status-bar-style"'), 'apple status bar style');
  assert.ok(html.includes('rel="apple-touch-icon"'), 'apple-touch-icon link');
  assert.ok(html.includes('id="modal-install"'), 'Install guide modal');
  assert.ok(html.includes('navigator.serviceWorker') && html.includes('.register('), 'Registers service worker');
});
