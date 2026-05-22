import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';

import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { uploadsQueryKey } from '../../../panel/api/use-uploads.ts';
import { useLogin } from '../use-login.ts';
import { useRegister } from '../use-register.ts';

function setup() {
  installBridgeMock({ tokens: null });
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  // Seed a previous session's cached history.
  queryClient.setQueryData(uploadsQueryKey(), [{ id: 'old' }]);
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper };
}

// All three auth transitions clear history (logout is covered in use-logout.test).
describe('clearing history on auth', () => {
  it('clears the upload cache + BYOK session on sign-in', async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: 'a@test.test', password: 'Password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(window.fileSalad.upload.clearSession).toHaveBeenCalled();
    expect(queryClient.getQueryData(uploadsQueryKey())).toBeUndefined();
  });

  it('clears the upload cache + BYOK session on create-account', async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useRegister(), { wrapper });
    result.current.mutate({ email: 'a@test.test', password: 'Password123' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(window.fileSalad.upload.clearSession).toHaveBeenCalled();
    expect(queryClient.getQueryData(uploadsQueryKey())).toBeUndefined();
  });
});
