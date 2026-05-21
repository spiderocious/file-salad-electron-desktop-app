import { vi } from 'vitest';

import type { FileSaladBridge } from '../../../shared/bridge.ts';
import type { ByokStatus, StoredTokens } from '../../../shared/types/storage.ts';
import { PROVIDER_CONFIG } from '../../../shared/provider-config.ts';

// An in-memory fake of the preload bridge for tests. State lives in closures so
// tests can drive auth/BYOK scenarios without a real main process. install()
// puts it on window.fileSalad; each test calls it fresh.
export interface BridgeMockState {
  tokens: StoredTokens | null;
  byok: ByokStatus;
  uploadMode: 'hosted' | 'byok';
}

export function installBridgeMock(initial?: Partial<BridgeMockState>): BridgeMockState {
  const state: BridgeMockState = {
    tokens: initial?.tokens ?? null,
    byok: initial?.byok ?? { configured: false, enabled: false },
    uploadMode: initial?.uploadMode ?? 'hosted',
  };

  const bridge: FileSaladBridge = {
    hidePanel: vi.fn(),
    getAppVersion: vi.fn(async () => '0.1.0'),
    auth: {
      getTokens: vi.fn(async () => state.tokens),
      setTokens: vi.fn(async (tokens: StoredTokens) => {
        state.tokens = tokens;
      }),
      clearTokens: vi.fn(async () => {
        state.tokens = null;
      }),
    },
    byok: {
      getStatus: vi.fn(async () => state.byok),
      save: vi.fn(async () => state.byok),
      setEnabled: vi.fn(async (enabled: boolean) => {
        state.byok = { ...state.byok, enabled };
        return state.byok;
      }),
      clear: vi.fn(async () => {
        state.byok = { configured: false, enabled: false };
        return state.byok;
      }),
    },
    providerConfig: {
      get: vi.fn(async () => PROVIDER_CONFIG),
    },
    upload: {
      perform: vi.fn(async () => ({
        uploadId: 'up_test',
        publicUrl: 'https://files.example.com/f_test',
        filename: 'f.png',
        size: 10,
        mode: state.uploadMode,
      })),
      list: vi.fn(async () => []),
      activeMode: vi.fn(async () => ({ mode: state.uploadMode })),
    },
  };

  (window as unknown as { fileSalad: FileSaladBridge }).fileSalad = bridge;
  return state;
}
