import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';
import type { ByokCredentials } from '../../../../../shared/types/storage.ts';

import { byokStatusQueryKey } from './use-byok-status.ts';

// Saves BYOK credentials (the secret key crosses to main once, write-only, and
// is never read back). Saving enables BYOK by default. Also exposes toggling
// and clearing, all of which refresh the cached status.
export function useSaveByok() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creds: ByokCredentials) => getBridge().byok.save(creds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: byokStatusQueryKey() }),
  });
}

export function useSetByokEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => getBridge().byok.setEnabled(enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: byokStatusQueryKey() }),
  });
}

export function useClearByok() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => getBridge().byok.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: byokStatusQueryKey() }),
  });
}
