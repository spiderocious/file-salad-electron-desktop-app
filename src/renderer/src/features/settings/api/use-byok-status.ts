import { useQuery } from '@tanstack/react-query';

import { getBridge, isBridgeReady } from '@shared/services/bridge.ts';
import type { ByokStatus } from '../../../../../shared/types/storage.ts';

const UNCONFIGURED: ByokStatus = { configured: false, enabled: false };

export const byokStatusQueryKey = () => ['byok-status'] as const;

// The non-secret BYOK status (configured? enabled? which provider/bucket). The
// secret key is never returned across the bridge — only whether one exists.
// Tolerates a not-yet-ready bridge (dev HMR) by reporting "unconfigured".
export function useByokStatus() {
  return useQuery<ByokStatus>({
    queryKey: byokStatusQueryKey(),
    queryFn: () => (isBridgeReady() ? getBridge().byok.getStatus() : Promise.resolve(UNCONFIGURED)),
    staleTime: 5_000,
  });
}
