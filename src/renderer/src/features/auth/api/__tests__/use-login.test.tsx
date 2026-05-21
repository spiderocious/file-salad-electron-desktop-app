import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENV } from '@shared/config/env.ts';
import { EP } from '@shared/constants/endpoints.ts';
import { ApiError } from '@shared/services/api-error.ts';

import { createTestWrapper } from '../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { server } from '../../../../test-utils/server.ts';
import { useLogin } from '../use-login.ts';

const base = `${ENV.API_BASE_URL}/api/v1`;

describe('useLogin', () => {
  it('signs in and persists tokens via the bridge', async () => {
    const state = installBridgeMock();
    const { result } = renderHook(() => useLogin(), { wrapper: createTestWrapper() });

    result.current.mutate({ email: 'alice@test.test', password: 'Password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.user.email).toBe('alice@test.test');
    // Tokens were stored through the bridge.
    expect(state.tokens?.accessToken).toBe('access_test');
  });

  it('surfaces invalid_credentials as an ApiError', async () => {
    installBridgeMock();
    server.use(
      http.post(`${base}${EP.AUTH.LOGIN}`, () =>
        HttpResponse.json(
          { error: { code: 'invalid_credentials', message: 'Wrong email or password' } },
          { status: 401 },
        ),
      ),
    );

    const { result } = renderHook(() => useLogin(), { wrapper: createTestWrapper() });
    result.current.mutate({ email: 'alice@test.test', password: 'nope' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect((result.current.error as ApiError).code).toBe('invalid_credentials');
  });
});
