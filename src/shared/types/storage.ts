// Domain types shared between the main process (where secrets + signing live)
// and the renderer. Kept free of any Node/Electron or DOM imports so both sides
// can use them.

// Supported BYOK object-storage providers. The set the UI offers is driven by
// the provider config (see provider-config.ts) — designed so the config can
// later come from the backend without the renderer changing.
export type StorageProvider = 's3' | 'r2' | 't3' | 'gcs';

// The credential bag a user enters for BYOK. Not all fields apply to every
// provider (e.g. only R2 needs accountId); the provider config declares which
// fields a given provider requires. `endpoint` and `publicBase` are always
// editable overrides — prefilled from the provider config but user-changeable.
export interface ByokCredentials {
  readonly provider: StorageProvider;
  readonly bucket: string;
  readonly accessKeyId: string;
  readonly secretKey: string;
  readonly region: string;
  readonly accountId?: string;
  // Editable overrides; when omitted the provider config derives them.
  readonly endpoint?: string;
  readonly publicBase?: string;
}

// What the renderer is allowed to see about saved BYOK config. The secret key
// is NEVER returned to the renderer — only whether one is present.
export interface ByokStatus {
  readonly configured: boolean;
  readonly enabled: boolean;
  readonly provider?: StorageProvider;
  readonly bucket?: string;
  readonly region?: string;
  readonly accountId?: string;
  readonly endpoint?: string;
  readonly publicBase?: string;
}

// Auth tokens persisted (encrypted) by the main process. Never stored in the
// renderer, localStorage, or React state.
export interface StoredTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  // Epoch ms when the access token expires.
  readonly expiresAt: number;
}
