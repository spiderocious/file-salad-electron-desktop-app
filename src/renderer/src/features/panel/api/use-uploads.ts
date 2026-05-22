import { useQuery } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';

import { useIsAllowed } from '../../auth/utils/use-is-allowed.ts';
import type { UploadListItem } from '../../../../../shared/types/upload.ts';

export const uploadsQueryKey = () => ['uploads'] as const;

// Reads the history opt-in flag from cache directly (the key string, not the
// hook) to avoid an import cycle with use-history-enabled.
function useHistoryEnabledFlag(): boolean {
  const q = useQuery<boolean>({
    queryKey: ['history-enabled'],
    queryFn: () => getBridge().history.getEnabled(),
    staleTime: Infinity,
  });
  return Boolean(q.data);
}

// Upload history through the active adapter. Hosted history comes from our
// backend; BYOK history is local to main — the renderer renders both the same.
// Gated on the user being allowed in (no 401 on the sign-in screen) AND on the
// history opt-in being on (we don't fetch a list the user chose not to keep).
export function useUploads() {
  const allowed = useIsAllowed();
  const historyEnabled = useHistoryEnabledFlag();
  return useQuery<UploadListItem[]>({
    queryKey: uploadsQueryKey(),
    queryFn: () => getBridge().upload.list(),
    enabled: allowed && historyEnabled,
    staleTime: 10_000,
  });
}
