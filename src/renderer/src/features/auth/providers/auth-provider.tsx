import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { hasStoredToken, useMe } from '../api/use-me.ts';
import type { AuthUser } from '@shared/types/api.ts';

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  // True until the initial token check + /me bootstrap settles.
  readonly isBootstrapping: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let active = true;
    hasStoredToken()
      .then((present) => {
        if (active) setHasToken(present);
      })
      .finally(() => {
        if (active) setTokenChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const me = useMe(tokenChecked && hasToken);
  const user = me.data ?? null;
  // While we hold a token, /me decides auth; with no token we're signed out.
  const isBootstrapping = !tokenChecked || (hasToken && me.isLoading);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), isBootstrapping }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
