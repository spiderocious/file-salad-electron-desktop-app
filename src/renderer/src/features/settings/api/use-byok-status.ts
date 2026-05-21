import { useQuery } from '@tanstack/react-query';

import type { ByokStatus } from '../../../../../shared/types/storage.ts';

export const byokStatusQueryKey = () => ['byok-status'] as const;

// The non-secret BYOK status (configured? enabled? which provider/bucket). The
// secret key is never returned across the bridge — only whether one exists.
export function useByokStatus() {
  return useQuery<ByokStatus>({
    queryKey: byokStatusQueryKey(),
    queryFn: () => window.fileSalad.byok.getStatus(),
    staleTime: 5_000,
  });
}
