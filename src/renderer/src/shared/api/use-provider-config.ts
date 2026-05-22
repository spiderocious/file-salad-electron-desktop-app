import { useQuery } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';

// The BYOK provider config (which providers exist, what fields each needs, how
// to derive endpoints/public URLs). The UI renders entirely from this — it has
// no hardcoded provider knowledge.
//
// Today the source is the bridge (main returns the bundled config). When the
// backend owns this config, only this queryFn changes (swap to apiClient.get) —
// every consumer keeps working unchanged. That's the whole point of fetching it
// through a hook rather than importing the map directly.
export const providerConfigQueryKey = () => ['provider-config'] as const;

export function useProviderConfig() {
  return useQuery({
    queryKey: providerConfigQueryKey(),
    queryFn: () => getBridge().providerConfig.get(),
    staleTime: Infinity,
  });
}
