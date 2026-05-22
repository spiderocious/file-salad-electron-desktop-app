import { createContext, useContext, type ReactNode } from 'react';

import { useMe, useTokenPresence } from '../api/use-me.ts';
import type { AuthUser } from '@shared/types/api.ts';

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  // True until the initial token check + /me bootstrap settles.
  readonly isBootstrapping: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Token presence is a query, so logging in/out (which invalidate it) flips
  // auth state reactively — no stale one-shot mount check.
  const tokenPresence = useTokenPresence();
  const hasToken = tokenPresence.data ?? false;

  const me = useMe(hasToken);
  const user = me.data ?? null;

  const isBootstrapping =
    tokenPresence.isLoading || (hasToken && me.isLoading && !me.isFetched);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isBootstrapping }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
