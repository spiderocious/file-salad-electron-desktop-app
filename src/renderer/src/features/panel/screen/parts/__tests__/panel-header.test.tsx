import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestWrapper } from '../../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../../test-utils/bridge-mock.ts';
import { PanelViewProvider } from '@shared/providers/panel-view-provider.tsx';
import { UploadCountProvider } from '../../../providers/upload-count-provider.tsx';
import { PanelHeader } from '../panel-header.tsx';

function renderHeader() {
  const Wrapper = createTestWrapper();
  return render(
    <Wrapper>
      <UploadCountProvider>
        <PanelViewProvider>
          <PanelHeader />
        </PanelViewProvider>
      </UploadCountProvider>
    </Wrapper>,
  );
}

describe('PanelHeader mode badge', () => {
  it('shows the Hosted badge when uploading to hosted storage', async () => {
    installBridgeMock({ uploadMode: 'hosted' });
    renderHeader();
    await waitFor(() => expect(screen.getByText('Hosted')).toBeInTheDocument());
  });

  it('shows the Your bucket badge when BYOK is active', async () => {
    installBridgeMock({ uploadMode: 'byok' });
    renderHeader();
    await waitFor(() => expect(screen.getByText('Your bucket')).toBeInTheDocument());
  });

  it('exposes a settings control', () => {
    installBridgeMock();
    renderHeader();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });
});
