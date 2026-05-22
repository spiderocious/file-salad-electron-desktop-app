import { awaitBridge } from '@shared/services/bridge.ts';
import type { StoredTokens } from '../../../../shared/types/storage.ts';

// Thin renderer-side accessor for the auth tokens. Tokens are persisted
// (encrypted) by the main process; this reads/writes them through the preload
// bridge — never localStorage or React state. Uses awaitBridge() so a call that
// lands during the dev-HMR window (preload re-injecting a tick late) waits for
// the bridge rather than throwing mid-mutation.
export const tokenService = {
  get: async (): Promise<StoredTokens | null> => (await awaitBridge()).auth.getTokens(),
  set: async (tokens: StoredTokens): Promise<void> => (await awaitBridge()).auth.setTokens(tokens),
  clear: async (): Promise<void> => (await awaitBridge()).auth.clearTokens(),
};
