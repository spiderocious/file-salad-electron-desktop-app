import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';

import { uploadsQueryKey } from './use-uploads.ts';

export const historyEnabledQueryKey = () => ['history-enabled'] as const;

// History is opt-in (off by default). The preference is persisted in main; when
// off we don't fetch or show the upload list.
export function useHistoryEnabled() {
  return useQuery({
    queryKey: historyEnabledQueryKey(),
    queryFn: () => getBridge().history.getEnabled(),
    staleTime: Infinity,
  });
}

export function useSetHistoryEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => getBridge().history.setEnabled(enabled),
    onSuccess: (_data, enabled) => {
      queryClient.setQueryData(historyEnabledQueryKey(), enabled);
      // Drop any cached rows when turning off; refetch fresh when turning on.
      if (!enabled) queryClient.removeQueries({ queryKey: uploadsQueryKey() });
      else void queryClient.invalidateQueries({ queryKey: uploadsQueryKey() });
    },
  });
}
