// Upload-flow types crossing the IPC boundary. The renderer hands the main
// process a file (as bytes) and gets back a uniform result — it never learns
// whether the bytes went to our hosted backend or the user's own bucket. The
// only mode signal is `mode`, used solely for a UI badge.
//
// Per docs/url-expiry.md, every file URL is presigned + short-lived. History
// stores the durable upload id + a cached URL with its expiry; when the cache is
// stale the renderer asks main to refresh it.

export type UploadMode = 'hosted' | 'byok';

// What the renderer sends main to perform an upload. Bytes travel as an
// ArrayBuffer so the main process can sign + PUT (BYOK) or presign+PUT (hosted)
// without the renderer touching secrets or signing.
export interface UploadRequest {
  readonly filename: string;
  readonly contentType: string;
  readonly bytes: ArrayBuffer;
  readonly size: number;
}

// Uniform upload result returned to the renderer regardless of adapter.
export interface UploadResult {
  readonly uploadId: string;
  readonly key: string;
  readonly publicUrl: string;
  // Absolute expiry of publicUrl (RFC3339). Empty when none applies (BYOK static
  // URLs) — treated as non-expiring there.
  readonly publicUrlExpiresAt: string;
  readonly filename: string;
  readonly size: number;
  readonly mode: UploadMode;
}

// A history row. Hosted history comes from our backend; BYOK history is local
// (the backend never sees BYOK uploads), but both render identically. The URL is
// a cache; cachedExpiresAt drives whether a copy refetches a fresh one.
export interface UploadListItem {
  readonly id: string;
  readonly filename: string;
  readonly key: string;
  readonly size: number;
  readonly timestamp: string;
  readonly mode: UploadMode;
  readonly cachedUrl: string;
  readonly cachedExpiresAt: string;
}

// A freshly-presigned URL for an upload, from main (hosted → download endpoint;
// BYOK → its static URL).
export interface RefreshedUrl {
  readonly url: string;
  // RFC3339; empty for BYOK static URLs (never expires from our side).
  readonly expiresAt: string;
}

// A minted share code (hosted uploads only).
export interface ShareCode {
  readonly code: string;
  readonly expiresInSeconds: number;
}

// A redeemed share code → the file's fresh download URL.
export interface RedeemedFile {
  readonly filename: string;
  readonly url: string;
  readonly expiresAt: string;
}

export interface UploadUsage {
  readonly used: number;
  readonly limit: number;
}

// Which adapter is currently active + why, for the UI badge. BYOK is active
// only when credentials are saved AND the "use my bucket" toggle is on.
export interface ActiveMode {
  readonly mode: UploadMode;
}
