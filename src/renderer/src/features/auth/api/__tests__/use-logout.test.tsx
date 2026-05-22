import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';

import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { uploadsQueryKey } from '../../../panel/api/use-uploads.ts';
import { useLogout } from '../use-logout.ts';

describe('useLogout', () => {
  it('clears tokens, the upload cache, and the BYOK session on logout', async () => {
    const state = installBridgeMock({
      tokens: { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 1e6 },
    });

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    // Seed a previous account's cached history.
    queryClient.setQueryData(uploadsQueryKey(), [{ id: 'old', filename: 'old.png' }]);

    function wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Tokens cleared via the bridge, BYOK session cleared, cache dropped.
    expect(state.tokens).toBeNull();
    expect(window.fileSalad.upload.clearSession).toHaveBeenCalled();
    expect(queryClient.getQueryData(uploadsQueryKey())).toBeUndefined();
  });
});
