import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';
import type { AuthUser } from '@shared/types/api.ts';

export const meQueryKey = () => ['me'] as const;

// Bootstraps the session on launch: if a stored token exists, fetch the user.
// `enabled` is gated on token presence so we don't fire /me when signed out.
export function useMe(hasToken: boolean) {
  return useQuery({
    queryKey: meQueryKey(),
    queryFn: () => apiClient.get<{ user: AuthUser }>(EP.ME, { auth: true }).then((d) => d.user),
    enabled: hasToken,
    retry: false,
  });
}

export async function hasStoredToken(): Promise<boolean> {
  return (await tokenService.get()) !== null;
}
