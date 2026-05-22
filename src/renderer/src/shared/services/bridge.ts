import type { FileSaladBridge } from '../../../../shared/bridge.ts';

// Single accessor for the preload bridge. The bridge is injected by the preload
// before page scripts, so in production it's always present — but during dev
// HMR there can be a brief window where the renderer re-executes before the
// preload re-injects. Reads can degrade via isBridgeReady(); writes (token
// set/clear after a login) should wait for it with awaitBridge() rather than
// throw mid-mutation.
export function isBridgeReady(): boolean {
  return typeof window !== 'undefined' && Boolean(window.fileSalad);
}

export function getBridge(): FileSaladBridge {
  if (!isBridgeReady()) {
    throw new Error('FileSalad bridge is not available (preload not loaded)');
  }
  return window.fileSalad;
}

// Resolves once the bridge is present, polling briefly. Covers the dev-HMR
// window where the renderer runs a tick before the preload re-injects. Rejects
// only if it never appears within the timeout (a genuine misconfiguration).
export async function awaitBridge(timeoutMs = 3000): Promise<FileSaladBridge> {
  if (isBridgeReady()) return window.fileSalad;
  const start = Date.now();
  return new Promise<FileSaladBridge>((resolve, reject) => {
    const interval = setInterval(() => {
      if (isBridgeReady()) {
        clearInterval(interval);
        resolve(window.fileSalad);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('FileSalad bridge is not available (preload not loaded)'));
      }
    }, 50);
  });
}
