import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { byokStatusQueryKey } from '../../settings/api/use-byok-status.ts';
import { ByokForm } from '../../settings/parts/byok-form.tsx';
import { AuthScreen } from './auth-screen.tsx';

interface AuthFlowProps {
  // Closes the auth drawer once the user is allowed in.
  readonly onComplete: () => void;
}

// The content of the auth drawer: login/register by default, switching to BYOK
// setup when the user chooses "use my own storage". Either path completing
// (auth success or BYOK saved) lets the host close the drawer.
export function AuthFlow({ onComplete }: AuthFlowProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'auth' | 'byok'>('auth');

  if (view === 'byok') {
    return (
      <div className="flex flex-col">
        <p className="mb-3 text-sm text-[var(--fs-text-secondary)]">
          Connect your own S3, R2, Tigris or GCS bucket. Your keys stay on this device.
        </p>
        <ByokForm
          submitLabel="Connect & continue"
          onSaved={() => {
            void queryClient.invalidateQueries({ queryKey: byokStatusQueryKey() });
            onComplete();
          }}
        />
        <button
          type="button"
          onClick={() => setView('auth')}
          className="mt-4 text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return <AuthScreen onUseOwnStorage={() => setView('byok')} onAuthenticated={onComplete} />;
}
