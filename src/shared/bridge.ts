import type { ProviderConfig } from './types/provider-config.ts';
import type { ByokCredentials, ByokStatus, StoredTokens } from './types/storage.ts';
import type { ActiveMode, UploadListItem, UploadRequest, UploadResult } from './types/upload.ts';

// The preload bridge contract — the only API surface the renderer sees on
// `window.fileSalad`. Shared between the preload implementation (which must
// satisfy it) and the renderer global declaration (which exposes it on Window).
//
// Secrets (auth tokens, BYOK secret key) live in the main process and are never
// returned to the renderer: token reads return tokens only so the renderer can
// attach a Bearer header (acceptable — the renderer needs to call our API), but
// BYOK reads return ByokStatus (no secret). Signing + the BYOK PUT happen in
// main, so the secret key never enters the renderer for storage uploads.
export interface FileSaladBridge {
  hidePanel: () => void;
  getAppVersion: () => Promise<string>;

  auth: {
    getTokens: () => Promise<StoredTokens | null>;
    setTokens: (tokens: StoredTokens) => Promise<void>;
    clearTokens: () => Promise<void>;
  };

  byok: {
    getStatus: () => Promise<ByokStatus>;
    save: (credentials: ByokCredentials) => Promise<ByokStatus>;
    setEnabled: (enabled: boolean) => Promise<ByokStatus>;
    clear: () => Promise<ByokStatus>;
  };

  providerConfig: {
    get: () => Promise<ProviderConfig>;
  };

  upload: {
    perform: (request: UploadRequest) => Promise<UploadResult>;
    list: () => Promise<UploadListItem[]>;
    activeMode: () => Promise<ActiveMode>;
  };
}
