import { useEffect, useRef } from 'react';

import { useDrawer } from '@shared/ui/drawer/drawer-host.tsx';

import { useByokStatus } from '../../settings/api/use-byok-status.ts';
import { useAuth } from '../providers/auth-provider.tsx';
import { AuthFlow } from '../screen/auth-flow.tsx';

// Effect-only gate. The canvas always renders; when the user isn't allowed in
// (not signed in AND no enabled BYOK), this opens a NON-dismissable auth drawer
// over the blurred canvas, and closes it once they're allowed (PRD D-5: BYOK
// users can skip signup; anyone can sign in later from settings).
export function AuthGuard() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const byok = useByokStatus();
  const drawer = useDrawer();
  const openedRef = useRef(false);

  const settling = isBootstrapping || byok.isLoading;
  const byokReady = Boolean(byok.data?.configured && byok.data?.enabled);
  const allowed = isAuthenticated || byokReady;

  useEffect(() => {
    if (settling) return;
    if (!allowed && !openedRef.current) {
      openedRef.current = true;
      drawer.open(<AuthFlow onComplete={() => drawer.close()} />, {
        dismissable: false,
        title: 'Sign in to FileSalad',
      });
    }
    if (allowed && openedRef.current) {
      openedRef.current = false;
      drawer.close();
    }
  }, [settling, allowed, drawer]);

  return null;
}
