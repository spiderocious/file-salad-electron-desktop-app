import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';

import { meQueryKey } from './use-me.ts';

// Revokes the refresh token server-side (best-effort), then clears local tokens
// and the cached user. Logout always succeeds locally even if the network call
// fails — the user expects to be signed out.
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const tokens = await tokenService.get();
      if (tokens) {
        await apiClient
          .post(EP.AUTH.LOGOUT, { refresh_token: tokens.refreshToken })
          .catch(() => undefined);
      }
      await tokenService.clear();
    },
    onSuccess: () => {
      queryClient.setQueryData(meQueryKey(), null);
      void queryClient.invalidateQueries({ queryKey: meQueryKey() });
    },
  });
}
