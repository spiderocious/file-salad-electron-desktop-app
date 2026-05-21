import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client.ts';
import { tokenService } from '@shared/services/token-service.ts';
import { EP } from '@shared/constants/endpoints.ts';
import type { AuthSession } from '@shared/types/api.ts';

export interface LoginPayload {
  readonly email: string;
  readonly password: string;
}

// Signs in and persists the returned tokens (in main, encrypted) via the token
// service. The session user is returned for the auth provider to hold.
export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const session = await apiClient.post<AuthSession>(EP.AUTH.LOGIN, payload);
      await tokenService.set({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: Date.now() + session.expires_in * 1000,
      });
      return session;
    },
  });
}
