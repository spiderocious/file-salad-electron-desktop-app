import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';
import type { AuthUser } from '@shared/types/api.ts';

export const meQueryKey = () => ['me'] as const;
export const tokenPresenceQueryKey = () => ['token-presence'] as const;

// Whether a stored token exists, as a query so it reacts to login/logout
// (which invalidate it) instead of being read once at mount.
export function useTokenPresence() {
  return useQuery({
    queryKey: tokenPresenceQueryKey(),
    queryFn: async () => (await tokenService.get()) !== null,
    staleTime: 0,
  });
}

// Fetches the authenticated user. Gated on a stored token being present so we
// don't fire /me while signed out. Refetches after login (meQueryKey is
// invalidated) and after the token-presence query flips.
export function useMe(hasToken: boolean) {
  return useQuery({
    queryKey: meQueryKey(),
    queryFn: () => apiClient.get<{ user: AuthUser }>(EP.ME, { auth: true }).then((d) => d.user),
    enabled: hasToken,
    retry: false,
  });
}
