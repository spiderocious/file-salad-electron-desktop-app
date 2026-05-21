import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';
import type { AuthSession } from '@shared/types/api.ts';

export interface RegisterPayload {
  readonly email: string;
  readonly password: string;
}

// Creates an account and persists the returned tokens. Same shape as login.
export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const session = await apiClient.post<AuthSession>(EP.AUTH.REGISTER, payload);
      await tokenService.set({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: Date.now() + session.expires_in * 1000,
      });
      return session;
    },
  });
}
