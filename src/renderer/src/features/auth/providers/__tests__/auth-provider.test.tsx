import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createTestWrapper } from '../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { useLogin } from '../../api/use-login.ts';
import { AuthProvider, useAuth } from '../auth-provider.tsx';

// Surfaces the bug where logging in didn't flip auth state (the provider read
// token presence once at mount). A login should make isAuthenticated → true
// without a reload.
function Harness() {
  const { isAuthenticated } = useAuth();
  const login = useLogin();
  return (
    <div>
      <span>auth:{String(isAuthenticated)}</span>
      <button
        type="button"
        onClick={() => login.mutate({ email: 'alice@test.test', password: 'Password123' })}
      >
        login
      </button>
    </div>
  );
}

describe('AuthProvider reactivity', () => {
  it('flips isAuthenticated to true after a successful login', async () => {
    installBridgeMock({ tokens: null });
    const Wrapper = createTestWrapper();
    const user = userEvent.setup();

    render(
      <Wrapper>
        <AuthProvider>
          <Harness />
        </AuthProvider>
      </Wrapper>,
    );

    // Starts signed out.
    await waitFor(() => expect(screen.getByText('auth:false')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'login' }));

    // Login stores the token (bridge mock) and invalidates auth state, so the
    // provider re-evaluates and /me resolves → authenticated.
    await waitFor(() => expect(screen.getByText('auth:true')).toBeInTheDocument());
  });
});
