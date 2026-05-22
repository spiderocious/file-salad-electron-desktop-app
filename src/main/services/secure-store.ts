import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { app, safeStorage } from 'electron';

import type { ByokCredentials, StoredTokens } from '@shared/types/storage.ts';

// On-disk secret store for the desktop app. Auth tokens and BYOK credentials
// (including the S3 secret key) are encrypted at rest with Electron's
// safeStorage — an OS-backed key (Keychain/DPAPI under the hood) — so we get
// persistence across restarts without writing plaintext secrets to disk and
// without any Keychain code of our own. The ciphertext lives in a single file
// under the app's userData dir.

interface StoreShape {
  tokens: StoredTokens | null;
  byok: ByokCredentials | null;
  byokEnabled: boolean;
  // History is opt-in (off by default) — see the privacy posture.
  historyEnabled: boolean;
}

const EMPTY: StoreShape = {
  tokens: null,
  byok: null,
  byokEnabled: false,
  historyEnabled: false,
};

function storePath(): string {
  return path.join(app.getPath('userData'), 'filesalad.store.enc');
}

function load(): StoreShape {
  const file = storePath();
  if (!existsSync(file)) return { ...EMPTY };
  try {
    const ciphertext = readFileSync(file);
    if (!safeStorage.isEncryptionAvailable()) return { ...EMPTY };
    const json = safeStorage.decryptString(ciphertext);
    return { ...EMPTY, ...(JSON.parse(json) as Partial<StoreShape>) };
  } catch {
    // Corrupt/undecryptable store — start clean rather than crash.
    return { ...EMPTY };
  }
}

function persist(state: StoreShape): void {
  const file = storePath();
  mkdirSync(path.dirname(file), { recursive: true });
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS encryption unavailable — refusing to write secrets in plaintext');
  }
  const ciphertext = safeStorage.encryptString(JSON.stringify(state));
  writeFileSync(file, ciphertext);
}

// Lazily loaded once, then kept in memory and re-persisted on writes.
let cache: StoreShape | null = null;
function state(): StoreShape {
  if (!cache) cache = load();
  return cache;
}

export const secureStore = {
  getTokens(): StoredTokens | null {
    return state().tokens;
  },
  setTokens(tokens: StoredTokens): void {
    cache = { ...state(), tokens };
    persist(cache);
  },
  clearTokens(): void {
    cache = { ...state(), tokens: null };
    persist(cache);
  },

  getByok(): ByokCredentials | null {
    return state().byok;
  },
  isByokEnabled(): boolean {
    return state().byokEnabled;
  },
  saveByok(credentials: ByokCredentials): void {
    // Saving credentials enables BYOK by default (the user just opted in).
    cache = { ...state(), byok: credentials, byokEnabled: true };
    persist(cache);
  },
  setByokEnabled(enabled: boolean): void {
    cache = { ...state(), byokEnabled: enabled };
    persist(cache);
  },
  clearByok(): void {
    cache = { ...state(), byok: null, byokEnabled: false };
    persist(cache);
  },

  isHistoryEnabled(): boolean {
    return state().historyEnabled;
  },
  setHistoryEnabled(enabled: boolean): void {
    cache = { ...state(), historyEnabled: enabled };
    persist(cache);
  },
};
