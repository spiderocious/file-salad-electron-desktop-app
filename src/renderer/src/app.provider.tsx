import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { PanelViewProvider } from '@shared/providers/panel-view-provider.tsx';

import { AuthProvider } from '@features/auth/providers/auth-provider.tsx';
import { UploadCountProvider } from '@features/panel/providers/upload-count-provider.tsx';

// Global providers. Server state via React Query; auth state, panel-view, and
// the session upload count via context. The app is a single fixed panel surface
// (no URL routing) — views are state-routed (panel ↔ settings).
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadCountProvider>
          <PanelViewProvider>{children}</PanelViewProvider>
        </UploadCountProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
