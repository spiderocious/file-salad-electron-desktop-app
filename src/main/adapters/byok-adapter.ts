import { randomUUID } from 'node:crypto';

import aws4 from 'aws4';

import type { ByokCredentials } from '@shared/types/storage.ts';
import type {
  RefreshedUrl,
  UploadListItem,
  UploadRequest,
  UploadResult,
} from '@shared/types/upload.ts';

import { buildPublicUrl, resolveByokTarget } from '../services/byok-endpoints.ts';
import type { UploadAdapter } from './upload-adapter.ts';

// Uploads directly to the user's own S3/R2/T3/GCS bucket. The backend is never
// contacted (PRD §5.2). Signing (AWS SigV4 via aws4) and the PUT happen here in
// main, so the secret key never enters the renderer. BYOK history is local
// (kept in main memory for the session) since there's no backend to list from.
// BYOK public URLs are static (no presign/expiry), so they never need refresh.
export class ByokAdapter implements UploadAdapter {
  private readonly creds: ByokCredentials;
  private static history: UploadListItem[] = [];

  constructor(creds: ByokCredentials) {
    this.creds = creds;
  }

  // Wipe the in-memory BYOK history (called on logout so a different account
  // doesn't inherit the previous session's local rows).
  static clearHistory(): void {
    ByokAdapter.history = [];
  }

  async perform(request: UploadRequest): Promise<UploadResult> {
    const { host, region } = resolveByokTarget(this.creds);
    const key = `${randomUUID()}-${sanitizeKey(request.filename)}`;
    const body = Buffer.from(request.bytes);

    // Path-style request: PUT https://{host}/{bucket}/{key}. aws4 computes the
    // SigV4 Authorization header for the S3 service from the access/secret keys.
    const signed = aws4.sign(
      {
        host,
        method: 'PUT',
        path: `/${this.creds.bucket}/${encodeURI(key)}`,
        service: 's3',
        region,
        headers: {
          'Content-Type': request.contentType,
          'Content-Length': String(body.length),
        },
        body,
      },
      { accessKeyId: this.creds.accessKeyId, secretAccessKey: this.creds.secretKey },
    );

    const response = await fetch(`https://${host}/${this.creds.bucket}/${encodeURI(key)}`, {
      method: 'PUT',
      headers: signed.headers as Record<string, string>,
      body,
    });

    if (!response.ok) {
      throw new Error(`BYOK upload failed: ${response.status} ${response.statusText}`);
    }

    const publicUrl = buildPublicUrl(this.creds, key);
    const result: UploadResult = {
      uploadId: key,
      key,
      publicUrl,
      // BYOK URLs are static (the user's public bucket base) — no expiry.
      publicUrlExpiresAt: '',
      filename: request.filename,
      size: request.size,
      mode: 'byok',
    };

    ByokAdapter.history.unshift({
      id: result.uploadId,
      filename: result.filename,
      key,
      size: result.size,
      timestamp: new Date().toISOString(),
      mode: 'byok',
      cachedUrl: publicUrl,
      // A static URL — treat as never-expiring so the row copies it directly.
      cachedExpiresAt: NEVER_EXPIRES,
    });

    return result;
  }

  async list(): Promise<UploadListItem[]> {
    return ByokAdapter.history;
  }

  async refreshUrl(uploadId: string): Promise<RefreshedUrl> {
    // Static URL — re-derive it from the key (== uploadId) for the user's bucket.
    return { url: buildPublicUrl(this.creds, uploadId), expiresAt: NEVER_EXPIRES };
  }
}

// Far-future sentinel so BYOK static URLs are never considered expired.
const NEVER_EXPIRES = '9999-12-31T23:59:59Z';

// Object keys must be URL/path safe; keep it simple and predictable.
function sanitizeKey(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}
