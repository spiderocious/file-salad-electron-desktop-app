import type { StoredTokens } from '../../../../shared/types/storage.ts';

// Thin renderer-side accessor for the auth tokens. Tokens are persisted
// (encrypted) by the main process; this just reads/writes them through the
// preload bridge. They're never stored in localStorage or React state.
export const tokenService = {
  get: (): Promise<StoredTokens | null> => window.fileSalad.auth.getTokens(),
  set: (tokens: StoredTokens): Promise<void> => window.fileSalad.auth.setTokens(tokens),
  clear: (): Promise<void> => window.fileSalad.auth.clearTokens(),
};
