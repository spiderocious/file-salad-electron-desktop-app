import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';
import type { AuthSession } from '@shared/types/api.ts';

import { clearUploadHistory } from './clear-upload-history.ts';
import { invalidateAuthState } from './invalidate-auth-state.ts';

export interface RegisterPayload {
  readonly email: string;
  readonly password: string;
}

// Creates an account and persists the returned tokens. Clears any existing
// history first so the new account starts clean, then refreshes the
// auth-dependent queries. Same shape as login.
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const session = await apiClient.post<AuthSession>(EP.AUTH.REGISTER, payload);
      await clearUploadHistory(queryClient);
      await tokenService.set({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: Date.now() + session.expires_in * 1000,
      });
      return session;
    },
    onSuccess: () => invalidateAuthState(queryClient),
  });
}
