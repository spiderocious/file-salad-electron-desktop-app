import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from '../drawer.tsx';

describe('Drawer', () => {
  it('renders its content when open', () => {
    render(
      <Drawer open onClose={vi.fn()} title="Settings">
        <p>Drawer body</p>
      </Drawer>,
    );
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('closes on backdrop click when dismissable', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer open onClose={onClose} dismissable>
        <p>Body</p>
      </Drawer>,
    );
    // The backdrop is the first Close-labelled control.
    await user.click(screen.getAllByRole('button', { name: /close/i })[0]!);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close on backdrop click when non-dismissable', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer open onClose={onClose} dismissable={false} title="Required">
        <p>Body</p>
      </Drawer>,
    );
    const backdrop = screen.getByRole('button', { name: /close/i });
    await user.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });
});
