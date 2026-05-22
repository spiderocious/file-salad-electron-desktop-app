import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { ENV } from '@shared/config/env.ts';
import { EP } from '@shared/constants/endpoints.ts';

import { createTestWrapper } from '../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { server } from '../../../../test-utils/server.ts';
import { AuthScreen } from '../auth-screen.tsx';

const base = `${ENV.API_BASE_URL}/api/v1`;

function renderScreen(onUseOwnStorage = vi.fn()) {
  const Wrapper = createTestWrapper();
  return render(
    <Wrapper>
      <AuthScreen onUseOwnStorage={onUseOwnStorage} />
    </Wrapper>,
  );
}

describe('AuthScreen', () => {
  it('defaults to login with a Welcome heading (no tabs)', () => {
    installBridgeMock();
    renderScreen();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    // No segment-control radios — the toggle is an inline link, not tabs.
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('toggles to create-account via the inline link', async () => {
    installBridgeMock();
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole('button', { name: /^create account$/i }));
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
  });

  it('validates the password inline before calling the API', async () => {
    installBridgeMock();
    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.test');
    await user.type(screen.getByPlaceholderText('••••••••'), 'short');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
  });

  it('shows an inline error on invalid credentials', async () => {
    installBridgeMock();
    server.use(
      http.post(`${base}${EP.AUTH.LOGIN}`, () =>
        HttpResponse.json({ error: { code: 'invalid_credentials', message: 'nope' } }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.test');
    await user.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/wrong email or password/i),
    );
  });

  it('invokes onUseOwnStorage from the BYOK link', async () => {
    installBridgeMock();
    const onUseOwnStorage = vi.fn();
    const user = userEvent.setup();
    renderScreen(onUseOwnStorage);

    await user.click(screen.getByRole('button', { name: /use my own storage instead/i }));
    expect(onUseOwnStorage).toHaveBeenCalledOnce();
  });
});
