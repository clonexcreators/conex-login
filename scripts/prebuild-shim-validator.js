import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shimDir = path.resolve(__dirname, '../src/shims');
if (!fs.existsSync(shimDir)) fs.mkdirSync(shimDir, { recursive: true });

// Define shim contents as separate variables
const useSyncExternalStoreShimContent = `// Fixed shim for use-sync-external-store with-selector
// Avoids problematic import paths and provides robust fallbacks

let useSyncExternalStoreWithSelector;

try {
  // Try multiple import strategies to find working implementation
  let found = false;
  
  // Strategy 1: Try the main package export
  try {
    const mainModule = require('use-sync-external-store');
    if (mainModule && mainModule.useSyncExternalStoreWithSelector) {
      useSyncExternalStoreWithSelector = mainModule.useSyncExternalStoreWithSelector;
      found = true;
    }
  } catch (e) { /* ignore */ }
  
  // Strategy 2: Try with-selector subpath
  if (!found) {
    try {
      const withSelectorModule = require('use-sync-external-store/with-selector');
      if (withSelectorModule && withSelectorModule.useSyncExternalStoreWithSelector) {
        useSyncExternalStoreWithSelector = withSelectorModule.useSyncExternalStoreWithSelector;
        found = true;
      }
    } catch (e) { /* ignore */ }
  }
  
  // Strategy 3: Provide fallback implementation
  if (!found) {
    console.warn('use-sync-external-store not found, using fallback implementation');
    
    useSyncExternalStoreWithSelector = (
      subscribe,
      getSnapshot,
      getServerSnapshot,
      selector,
      isEqual
    ) => {
      // Simple fallback - just apply selector to snapshot
      const snapshot = getSnapshot();
      return selector ? selector(snapshot) : snapshot;
    };
  }
  
} catch (error) {
  console.warn('use-sync-external-store shim failed, using minimal fallback');
  
  // Minimal fallback implementation
  useSyncExternalStoreWithSelector = (
    subscribe,
    getSnapshot,
    getServerSnapshot,
    selector,
    isEqual
  ) => {
    const snapshot = getSnapshot();
    return selector ? selector(snapshot) : snapshot;
  };
}

// Ensure we always export a function
if (typeof useSyncExternalStoreWithSelector !== 'function') {
  useSyncExternalStoreWithSelector = () => null;
}

export { useSyncExternalStoreWithSelector };
export default {
  useSyncExternalStoreWithSelector
};`;

const eventsShimContent = `// Events shim for Node.js events module
class EventEmitter {
  constructor() {
    this.events = {};
    this.maxListeners = 10;
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event, listener) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
    return this.events[event].length > 0;
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    this.on(event, onceWrapper);
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }

  listeners(event) {
    return this.events[event] || [];
  }
}

export { EventEmitter };
export default EventEmitter;`;

const mittShimContent = `import * as mittModule from 'mitt';
const mitt = mittModule.default || mittModule;
export default mitt;`;

const pinoShimContent = `export default {
  fatal: console.error,
  error: console.error,
  warn: console.warn,
  info: console.log,
  debug: console.debug,
  trace: console.trace,
  silent: () => {}
};`;

const useLocalStorageShimContent = `// React-use localStorage shim
import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('localStorage parse error:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('localStorage set error:', error);
    }
  };

  return [storedValue, setValue];
}`;

const shims = [
  {
    name: 'use-sync-external-store-with-selector.js',
    module: 'use-sync-external-store/with-selector',
    content: useSyncExternalStoreShimContent
  },
  {
    name: 'events.js',
    module: 'events',
    content: eventsShimContent
  },
  {
    name: 'useLocalStorage.js', 
    module: 'react-use/lib/useLocalStorage',
    content: useLocalStorageShimContent
  },
  {
    name: 'mitt.js',
    module: 'mitt',
    content: mittShimContent
  },
  {
    name: 'pino-browser.js',
    module: 'pino/browser.js',
    content: pinoShimContent
  }
  // Removed eventemitter3 - now using the real package
];

// Write shim files - FIX: Use actual newline, not literal \n
console.log('📝 Writing compatibility shims...');
console.log('');
for (const shim of shims) {
  // Skip walletconnect logger — managed manually as .mjs
  if (shim.name === 'walletconnect-logger.js' || shim.name === 'walletconnect-logger.mjs') {
    console.log('⏩ Skipping shim: ' + shim.name + ' (managed manually)');
    continue;
  }
  
  const filePath = path.join(shimDir, shim.name);
  // FIXED: Write with actual newline character, not literal '\n'
  fs.writeFileSync(filePath, shim.content + '\n');
  console.log('✅ Shim written: ' + filePath);
}

// Known problem modules to patch (removed eventemitter3)
const patchableModules = [
  { name: 'mitt', main: 'index.js' },
  { name: 'pino', main: 'browser.js' },
  { name: 'use-sync-external-store', main: 'shim/with-selector.js' }
];

// Additional ESM troublemakers to detect (warn only)
const knownOffenders = [
  'nanoevents',
  'universal-cookie',
  'react-use',
  '@walletconnect/logger',
  '@pinojs/browser'
];

console.log('');
console.log('🔍 Patching node_modules for broken ESM exports:');
console.log('');

for (const mod of patchableModules) {
  const pkgJsonPath = path.resolve(__dirname, '../node_modules', mod.name, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    console.warn('⚠️ Skipped ' + mod.name + ': package.json not found');
    continue;
  }

  const pkgData = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  const backupPath = pkgJsonPath + '.bak';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(pkgJsonPath, backupPath);
    console.log('🧷 Backup created: ' + mod.name + '/package.json.bak');
  }

  if (!pkgData.exports || typeof pkgData.exports !== 'object') {
    pkgData.exports = {
      '.': {
        import: './' + mod.main,
        require: './' + mod.main
      }
    };
    console.log('🛠 Patched exports in: ' + mod.name + '/package.json');
  } else if (!pkgData.exports['.'] || !pkgData.exports['.'].import) {
    pkgData.exports['.'] = {
      ...pkgData.exports['.'],
      import: './' + mod.main
    };
    console.log('🔧 Extended exports.import for: ' + mod.name + '/package.json');
  }

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgData, null, 2));
}

// Warn for known ESM offenders
console.log('');
console.log('🚨 Scanning for other known ESM-breaker modules:');
console.log('');
for (const pkg of knownOffenders) {
  const offenderPath = path.resolve(__dirname, '../node_modules', pkg);
  if (fs.existsSync(offenderPath)) {
    console.warn('⚠️ Warning: Detected potential ESM issue with "' + pkg + '". Consider shimming or verifying its exports.');
  }
}

console.log('');
console.log('🎉 Prebuild validation completed successfully!');
console.log('🔧 Run "npm run dev" to start development with patched modules');
console.log('✨ Now using real eventemitter3 package instead of custom shim');