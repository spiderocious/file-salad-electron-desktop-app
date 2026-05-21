import { ENV } from '@shared/config/env.ts';
import { EP } from '@shared/constants/endpoints.ts';
import { ApiError } from '@shared/services/api-error.ts';
import { tokenService } from '@shared/services/token-service.ts';
import type { ApiFailure, ApiSuccess } from '@shared/types/api.ts';
import type { StoredTokens } from '../../../../shared/types/storage.ts';

const API_PREFIX = '/api/v1';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  readonly body?: unknown;
  // Most routes need the Bearer access token; /auth/* (login/register/refresh)
  // do not.
  readonly auth?: boolean;
}

async function refreshOnce(current: StoredTokens): Promise<StoredTokens | null> {
  const res = await fetch(`${ENV.API_BASE_URL}${API_PREFIX}${EP.AUTH.REFRESH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: current.refreshToken }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as ApiSuccess<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
  const tokens: StoredTokens = {
    accessToken: json.data.access_token,
    refreshToken: json.data.refresh_token,
    expiresAt: Date.now() + json.data.expires_in * 1000,
  };
  await tokenService.set(tokens);
  return tokens;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
  retrying = false,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const tokens = options.auth ? await tokenService.get() : null;
  if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;

  const res = await fetch(`${ENV.API_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // On a 401 for an authed call, refresh the token once then retry; if refresh
  // fails, clear tokens so the auth guard bounces the user to sign-in.
  if (res.status === 401 && options.auth && tokens && !retrying) {
    const refreshed = await refreshOnce(tokens);
    if (refreshed) return request<T>(method, path, options, true);
    await tokenService.clear();
  }

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!res.ok) {
    const failure = json as ApiFailure | null;
    if (failure?.error) throw new ApiError(res.status, failure.error);
    throw new ApiError(res.status, { code: 'internal', message: 'Request failed' });
  }
  return (json as ApiSuccess<T>).data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
};
