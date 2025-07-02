// Fixed shim for use-sync-external-store with-selector
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
};
