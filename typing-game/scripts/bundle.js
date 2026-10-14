// Generates a self-contained bundle.js for browser environments (including file:// URLs)
// where ES module loading is restricted by browser CORS security policies.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const jsDir = path.join(rootDir, 'js');
const targetFile = path.join(rootDir, 'bundle.js');

const files = [
  'words.js',
  'dinos.js',
  'layout.js',
  'dino-art.js',
  'engine.js',
  'textgen.js',
  'curriculum.js',
  'storage.js',
  'scene.js',
  'audio.js',
  'fx.js',
  'keyboard-view.js',
  'game-modes.js',
  'world-map.js',
  'main.js',
];

function transformModule(filename, code) {
  // Normalize module key
  const modKey = filename.replace(/\.js$/, '');

  // Find all named exports: export const/let/var/function/class foo
  const exportNames = [];
  const exportRegex = /export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g;
  let m;
  while ((m = exportRegex.exec(code)) !== null) {
    exportNames.push(m[1]);
  }

  // Also match export { a, b, c }
  const namedExportRegex = /export\s*\{([^}]+)\};?/g;
  let nm;
  while ((nm = namedExportRegex.exec(code)) !== null) {
    const list = nm[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    exportNames.push(...list);
  }

  // Convert imports: import { a, b } from './foo.js';
  let transformed = code.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]\.\/([^'"]+?)(\.js)?['"];?/g,
    (_, imports, fromMod) => {
      return `const { ${imports.trim()} } = require("${fromMod}");`;
    }
  );

  // Convert export declarations to plain local declarations
  transformed = transformed.replace(/export\s+(const|let|var)\s+/g, '$1 ');
  transformed = transformed.replace(/export\s+function\s+/g, 'function ');
  transformed = transformed.replace(/export\s+class\s+/g, 'class ');
  transformed = transformed.replace(/export\s*\{[^}]+?\};?/g, '');

  const exportAssign = exportNames.length
    ? `\n    Object.assign(exports, { ${[...new Set(exportNames)].join(', ')} });`
    : '';

  return `
  /* === Module: ${filename} === */
  define("${modKey}", function(exports, require) {
${transformed}${exportAssign}
  });`;
}

function build() {
  let output = `/* Dino Keys – Touch Typing Game (Browser Bundle) */
(function() {
  "use strict";

  var modules = {};

  function define(id, factory) {
    modules[id] = { factory: factory, exports: {}, loaded: false };
  }

  function require(id) {
    var key = id.replace(/^\\.\\//, '').replace(/\\.js$/, '');
    var mod = modules[key];
    if (!mod) {
      throw new Error("Module not found: " + id);
    }
    if (!mod.loaded) {
      mod.loaded = true;
      mod.factory(mod.exports, require);
    }
    return mod.exports;
  }
`;

  for (const file of files) {
    const filePath = path.join(jsDir, file);
    const code = fs.readFileSync(filePath, 'utf8');
    output += transformModule(file, code) + '\n';
  }

  output += `
  // Initialize entry point
  require("main");
})();
`;

  fs.writeFileSync(targetFile, output, 'utf8');
  console.log(`Successfully built ${targetFile} (${(output.length / 1024).toFixed(1)} KB)`);
}

build();
