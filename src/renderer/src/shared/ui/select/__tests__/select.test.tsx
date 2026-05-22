import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Select } from '../select.tsx';

const options = [
  { value: 't3', label: 'Tigris' },
  { value: 'r2', label: 'Cloudflare R2' },
];

describe('Select', () => {
  it('shows the selected option label', () => {
    render(<Select value="t3" options={options} onChange={vi.fn()} aria-label="Provider" />);
    expect(screen.getByRole('button', { name: /provider/i })).toHaveTextContent('Tigris');
  });

  it('opens the list and emits the chosen value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select value="t3" options={options} onChange={onChange} aria-label="Provider" />);

    await user.click(screen.getByRole('button', { name: /provider/i }));
    await user.click(screen.getByRole('option', { name: /cloudflare r2/i }));
    expect(onChange).toHaveBeenCalledWith('r2');
  });
});
