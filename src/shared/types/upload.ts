// Upload-flow types crossing the IPC boundary. The renderer hands the main
// process a file (as bytes) and gets back a uniform result — it never learns
// whether the bytes went to our hosted backend or the user's own bucket. The
// only mode signal is `mode`, used solely for a UI badge.

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
  readonly publicUrl: string;
  readonly filename: string;
  readonly size: number;
  readonly mode: UploadMode;
}

// A history row. Hosted history comes from our backend; BYOK history is local
// (the backend never sees BYOK uploads), but both render identically.
export interface UploadListItem {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly size: number;
  readonly timestamp: string;
  readonly mode: UploadMode;
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
