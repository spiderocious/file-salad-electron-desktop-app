import type { FileSaladBridge } from '../../shared/bridge.ts';

// The preload bridge is exposed on window.fileSalad (see src/preload/index.ts).
declare global {
  interface Window {
    fileSalad: FileSaladBridge;
  }
}

export {};
