import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { DrawerHost } from '@shared/ui/drawer/drawer-host.tsx';

import { AuthProvider } from '@features/auth/providers/auth-provider.tsx';
import { UploadCountProvider } from '@features/panel/providers/upload-count-provider.tsx';

// Global providers. Server state via React Query; auth state + session upload
// count via context. The DrawerHost renders every non-canvas screen (auth,
// settings, history) as a bottom-up drawer over the upload canvas.
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
          <DrawerHost>{children}</DrawerHost>
        </UploadCountProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
