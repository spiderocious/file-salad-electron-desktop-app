import { useQuery } from '@tanstack/react-query';

import type { ActiveMode } from '../../../../../shared/types/upload.ts';

export const activeModeQueryKey = () => ['active-mode'] as const;

// Which adapter is live (hosted | byok), for the panel's mode badge. Driven by
// whether the user has saved keys and toggled "use my bucket" on.
export function useActiveMode() {
  return useQuery<ActiveMode>({
    queryKey: activeModeQueryKey(),
    queryFn: () => window.fileSalad.upload.activeMode(),
    staleTime: 1_000,
  });
}
