import { useMutation } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';
import type { RefreshedUrl } from '../../../../../shared/types/upload.ts';

// Asks main for a fresh presigned URL for an upload (hosted → download endpoint;
// BYOK → its static URL). Used when a row's cached URL has expired.
export function useRefreshUrl() {
  return useMutation<RefreshedUrl, Error, string>({
    mutationFn: (uploadId) => getBridge().upload.refreshUrl(uploadId),
  });
}
