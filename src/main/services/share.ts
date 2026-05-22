import { backendRequest } from './backend-client.ts';

// Share codes go through our backend (POST /share, GET /share/:code). Only
// hosted uploads can be shared — BYOK uploads never reach our backend, so the
// renderer gates the Share action for them.

export interface ShareCode {
  readonly code: string;
  readonly expiresInSeconds: number;
}

export interface RedeemedFile {
  readonly filename: string;
  readonly url: string;
  readonly expiresAt: string;
}

interface ShareCreateResponse {
  code: string;
  expires_in: number;
}

interface RedeemResponse {
  filename: string;
  download_url: string;
  expires_in: number;
  expires_at: string;
  cached: boolean;
}

export async function createShareCode(uploadId: string): Promise<ShareCode> {
  const res = await backendRequest<ShareCreateResponse>('POST', '/share', {
    upload_id: uploadId,
  });
  return { code: res.code, expiresInSeconds: res.expires_in };
}

export async function redeemShareCode(code: string): Promise<RedeemedFile> {
  const normalized = code.trim().toUpperCase();
  const res = await backendRequest<RedeemResponse>('GET', `/share/${normalized}`);
  return { filename: res.filename, url: res.download_url, expiresAt: res.expires_at };
}
