import type { QueryClient } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';

import { uploadsQueryKey } from '../../panel/api/use-uploads.ts';

// Wipes all upload history so one account never sees another's. Called on the
// three auth transitions: logout, sign-in, and create-account. It must NOT use
// invalidateQueries (that would refetch and resurrect the rows) — it removes the
// cached query and clears main's local/BYOK session list.
export async function clearUploadHistory(queryClient: QueryClient): Promise<void> {
  await getBridge().upload.clearSession();
  queryClient.removeQueries({ queryKey: uploadsQueryKey() });
}
