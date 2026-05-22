import { secureStore } from './secure-store.ts';
import type { StoredTokens } from '@shared/types/storage.ts';

const API_PREFIX = '/api/v1';

function baseUrl(): string {
  return process.env.FILESALAD_API_BASE_URL ?? 'http://localhost:8096';
}

export class BackendError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'BackendError';
    this.status = status;
    this.code = code;
  }
}

interface Envelope<T> {
  data?: T;
  error?: { code: string; message: string };
}

async function refreshTokens(current: StoredTokens): Promise<StoredTokens | null> {
  const res = await fetch(`${baseUrl()}${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: current.refreshToken }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as Envelope<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
  if (!json.data) return null;
  const tokens: StoredTokens = {
    accessToken: json.data.access_token,
    refreshToken: json.data.refresh_token,
    expiresAt: Date.now() + json.data.expires_in * 1000,
  };
  secureStore.setTokens(tokens);
  return tokens;
}

export async function backendRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  retrying = false,
): Promise<T> {
  const tokens = secureStore.getTokens();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;

  const res = await fetch(`${baseUrl()}${API_PREFIX}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (res.status === 401 && tokens && !retrying) {
    const refreshed = await refreshTokens(tokens);
    if (refreshed) return backendRequest<T>(method, path, body, true);
    secureStore.clearTokens();
  }

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok) {
    const err = json?.error;
    throw new BackendError(res.status, err?.code ?? 'internal', err?.message ?? 'Request failed');
  }
  return (json as Envelope<T>).data as T;
}
