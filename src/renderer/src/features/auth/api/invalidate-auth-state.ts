import type { QueryClient } from '@tanstack/react-query';

import { activeModeQueryKey } from '../../panel/api/use-active-mode.ts';
import { meQueryKey, tokenPresenceQueryKey } from './use-me.ts';

// After auth changes (login / register / logout), refresh the session-dependent
// queries: token presence (flips hasToken → /me runs), the user, and the active
// storage mode (hosted vs BYOK badge).
//
// Uploads are deliberately NOT invalidated here — invalidation refetches, which
// would resurrect a just-cleared history. History is cleared explicitly via
// clearUploadHistory() (remove, not invalidate) and then refetched fresh once
// useUploads re-enables for the new session.
export function invalidateAuthState(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: tokenPresenceQueryKey() });
  void queryClient.invalidateQueries({ queryKey: meQueryKey() });
  void queryClient.invalidateQueries({ queryKey: activeModeQueryKey() });
}
