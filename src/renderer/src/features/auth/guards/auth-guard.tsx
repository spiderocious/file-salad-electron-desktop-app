import { Loader2 } from '@icons';
import { Show } from 'meemaw';
import type { ReactNode } from 'react';

import { useByokStatus } from '../../settings/api/use-byok-status.ts';
import { useAuth } from '../providers/auth-provider.tsx';
import { AuthScreen } from '../screen/auth-screen.tsx';

interface AuthGuardProps {
  readonly children: ReactNode;
}

// Gates the panel. A user reaches it by signing in OR by configuring BYOK and
// turning it on (they can skip signup and use their own bucket — PRD D-5). They
// can still sign in later from settings.
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const byok = useByokStatus();

  const settling = isBootstrapping || byok.isLoading;
  const byokReady = Boolean(byok.data?.configured && byok.data?.enabled);
  const allowed = isAuthenticated || byokReady;

  return (
    <Show
      when={!settling}
      fallback={
        <div className="flex h-screen items-center justify-center bg-[var(--fs-bg)]">
          <Loader2 className="animate-spin text-[var(--fs-accent)]" size={28} />
        </div>
      }
    >
      <Show when={allowed} fallback={<AuthScreen />}>
        {children}
      </Show>
    </Show>
  );
}
