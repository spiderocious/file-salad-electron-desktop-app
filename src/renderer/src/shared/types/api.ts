// The backend's response envelope (docs/api-docs.md). Success carries `data`;
// failure carries `error` with a stable `code` — switch on code, never message.
export interface ApiSuccess<T> {
  readonly data: T;
}

export type ApiErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'invalid_credentials'
  | 'token_expired'
  | 'token_invalid'
  | 'forbidden'
  | 'quota_exceeded'
  | 'not_found'
  | 'conflict'
  | 'email_exists'
  | 'file_too_large'
  | 'rate_limited'
  | 'storage_unavailable'
  | 'internal';

export interface ApiErrorBody {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly field_errors?: Readonly<Record<string, readonly string[]>>;
}

export interface ApiFailure {
  readonly error: ApiErrorBody;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly created_at: string;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
}
