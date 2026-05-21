import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestWrapper } from '../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { PanelViewProvider } from '@shared/providers/panel-view-provider.tsx';
import { AuthProvider } from '../../providers/auth-provider.tsx';
import { AuthGuard } from '../auth-guard.tsx';

function renderGuard() {
  const Wrapper = createTestWrapper();
  return render(
    <Wrapper>
      <AuthProvider>
        <PanelViewProvider>
          <AuthGuard>
            <div>PANEL CONTENT</div>
          </AuthGuard>
        </PanelViewProvider>
      </AuthProvider>
    </Wrapper>,
  );
}

describe('AuthGuard', () => {
  it('shows the auth screen when signed out and no BYOK', async () => {
    installBridgeMock({ tokens: null, byok: { configured: false, enabled: false } });
    renderGuard();
    // Auth screen renders the sign-in control; panel content stays hidden.
    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.queryByText('PANEL CONTENT')).not.toBeInTheDocument();
  });

  it('allows the panel when BYOK is configured and enabled (no account)', async () => {
    installBridgeMock({
      tokens: null,
      byok: { configured: true, enabled: true, provider: 't3', bucket: 'b' },
    });
    renderGuard();
    await waitFor(() => expect(screen.getByText('PANEL CONTENT')).toBeInTheDocument());
  });
});
