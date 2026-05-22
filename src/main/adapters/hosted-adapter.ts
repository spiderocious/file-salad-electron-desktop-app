import type {
  RefreshedUrl,
  UploadListItem,
  UploadRequest,
  UploadResult,
} from '@shared/types/upload.ts';

import { backendRequest } from '../services/backend-client.ts';
import type { UploadAdapter } from './upload-adapter.ts';

// Hosted free-tier flow against our backend: presign → PUT bytes to storage →
// complete. Runs in main so it shares the token store + refresh logic with the
// rest of the app. The backend enforces the monthly cap + per-file size at
// presign (surfaced as BackendError quota_exceeded / file_too_large). Per
// docs/url-expiry.md, public/download URLs are presigned + short-lived, so we
// surface their expiry and can refresh via the download endpoint.

interface PresignResponse {
  upload_id: string;
  key: string;
  upload_url: string;
  public_url: string;
  // New expiry fields (additive). `expires_in` is deprecated (it's the upload_url's).
  public_url_expires_at?: string;
  usage: { used: number; limit: number };
}

interface UploadRecord {
  id: string;
  filename: string;
  key?: string;
  public_url: string;
  size: number;
  status: string;
  created_at: string;
}

interface DownloadResponse {
  download_url: string;
  expires_in: number;
  expires_at: string;
}

export class HostedAdapter implements UploadAdapter {
  async perform(request: UploadRequest): Promise<UploadResult> {
    const presign = await backendRequest<PresignResponse>('POST', '/uploads/presign', {
      filename: request.filename,
      content_type: request.contentType,
      size: request.size,
    });

    const putRes = await fetch(presign.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': request.contentType },
      body: Buffer.from(request.bytes),
    });
    if (!putRes.ok) {
      throw new Error(`Hosted upload failed: ${putRes.status} ${putRes.statusText}`);
    }

    await backendRequest('POST', `/uploads/${presign.upload_id}/complete`);

    return {
      uploadId: presign.upload_id,
      key: presign.key,
      publicUrl: presign.public_url,
      publicUrlExpiresAt: presign.public_url_expires_at ?? '',
      filename: request.filename,
      size: request.size,
      mode: 'hosted',
    };
  }

  async list(): Promise<UploadListItem[]> {
    const records = await backendRequest<UploadRecord[]>('GET', '/uploads?limit=50');
    return records.map((r) => ({
      id: r.id,
      filename: r.filename,
      key: r.key ?? '',
      size: r.size,
      timestamp: r.created_at,
      mode: 'hosted' as const,
      // The list endpoint returns a presigned public_url without an expiry, so
      // treat it as stale ('' expiry) — the first copy refetches a fresh URL.
      cachedUrl: r.public_url,
      cachedExpiresAt: '',
    }));
  }

  async refreshUrl(uploadId: string): Promise<RefreshedUrl> {
    const res = await backendRequest<DownloadResponse>('GET', `/uploads/${uploadId}/download`);
    return { url: res.download_url, expiresAt: res.expires_at };
  }
}
