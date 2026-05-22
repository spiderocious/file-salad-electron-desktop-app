import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestWrapper } from '../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { DrawerHost } from '@shared/ui/drawer/drawer-host.tsx';
import { AuthProvider } from '../../providers/auth-provider.tsx';
import { AuthGuard } from '../auth-guard.tsx';

function renderGuard() {
  const Wrapper = createTestWrapper();
  return render(
    <Wrapper>
      <AuthProvider>
        <DrawerHost>
          <div>CANVAS</div>
          <AuthGuard />
        </DrawerHost>
      </AuthProvider>
    </Wrapper>,
  );
}

describe('AuthGuard', () => {
  it('opens the auth drawer over the canvas when signed out with no BYOK', async () => {
    installBridgeMock({ tokens: null, byok: { configured: false, enabled: false } });
    renderGuard();
    // Canvas always renders; the auth drawer is layered over it.
    expect(screen.getByText('CANVAS')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('does not open the auth drawer when BYOK is configured and enabled', async () => {
    installBridgeMock({
      tokens: null,
      byok: { configured: true, enabled: true, provider: 't3', bucket: 'b' },
    });
    renderGuard();
    await waitFor(() => expect(screen.getByText('CANVAS')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /^sign in$/i })).not.toBeInTheDocument();
  });
});
