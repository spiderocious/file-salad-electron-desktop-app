import { useByokStatus } from '../../settings/api/use-byok-status.ts';
import { useAuth } from '../providers/auth-provider.tsx';

// The single "can this user use the panel?" rule, shared by the guard and by
// data hooks that must not fire until the user is in (signed in OR BYOK
// enabled) — otherwise hosted /uploads calls 401 on the sign-in screen.
export function useIsAllowed(): boolean {
  const { isAuthenticated } = useAuth();
  const byok = useByokStatus();
  return isAuthenticated || Boolean(byok.data?.configured && byok.data?.enabled);
}
