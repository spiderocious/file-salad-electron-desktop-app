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
        key: 'f_test',
        publicUrl: 'https://files.example.com/f_test',
        publicUrlExpiresAt: '2099-01-01T00:00:00Z',
        filename: 'f.png',
        size: 10,
        mode: state.uploadMode,
      })),
      list: vi.fn(async () => []),
      activeMode: vi.fn(async () => ({ mode: state.uploadMode })),
      refreshUrl: vi.fn(async () => ({
        url: 'https://files.example.com/fresh',
        expiresAt: '2099-01-01T02:00:00Z',
      })),
      clearSession: vi.fn(async () => undefined),
    },
    share: {
      create: vi.fn(async () => ({ code: 'K7M2QPF', expiresInSeconds: 86400 })),
      redeem: vi.fn(async () => ({
        filename: 'shared.png',
        url: 'https://files.example.com/shared',
        expiresAt: '2099-01-01T02:00:00Z',
      })),
    },
    history: {
      getEnabled: vi.fn(async () => false),
      setEnabled: vi.fn(async () => undefined),
    },
    openExternal: vi.fn(async () => undefined),
  };

  (window as unknown as { fileSalad: FileSaladBridge }).fileSalad = bridge;
  return state;
}
