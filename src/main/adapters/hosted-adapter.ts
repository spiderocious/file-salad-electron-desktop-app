import type { UploadListItem, UploadRequest, UploadResult } from '@shared/types/upload.ts';

import { backendRequest } from '../services/backend-client.ts';
import type { UploadAdapter } from './upload-adapter.ts';

// Hosted free-tier flow against our backend: presign → PUT bytes to storage →
// complete. Runs in main so it shares the token store + refresh logic with the
// rest of the app. The backend enforces the monthly cap + per-file size at
// presign (surfaced as BackendError quota_exceeded / file_too_large).

interface PresignResponse {
  upload_id: string;
  key: string;
  upload_url: string;
  public_url: string;
  expires_in: number;
  usage: { used: number; limit: number };
}

interface UploadRecord {
  id: string;
  filename: string;
  public_url: string;
  size: number;
  status: string;
  created_at: string;
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
      publicUrl: presign.public_url,
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
      url: r.public_url,
      size: r.size,
      timestamp: r.created_at,
      mode: 'hosted' as const,
    }));
  }
}
