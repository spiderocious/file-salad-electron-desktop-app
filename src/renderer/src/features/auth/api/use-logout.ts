import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';

import { clearUploadHistory } from './clear-upload-history.ts';
import { invalidateAuthState } from './invalidate-auth-state.ts';
import { meQueryKey } from './use-me.ts';

// Revokes the refresh token server-side (best-effort), clears local tokens, and
// wipes upload history so the next account never sees the previous one's rows.
// Logout always succeeds locally even if the network call fails.
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
      await clearUploadHistory(queryClient);
    },
    onSuccess: () => {
      queryClient.setQueryData(meQueryKey(), null);
      invalidateAuthState(queryClient);
    },
  });
}
