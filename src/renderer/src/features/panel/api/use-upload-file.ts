import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';
import type { UploadResult } from '../../../../../shared/types/upload.ts';

import { uploadsQueryKey } from './use-uploads.ts';

// Uploads a file through the active adapter (hosted or BYOK) in main — the
// renderer reads the file into an ArrayBuffer and hands it over; it never learns
// where the bytes went beyond the `mode` on the result. Invalidates the history
// list so the new upload appears.
export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation<UploadResult, Error, File>({
    mutationFn: async (file) => {
      const bytes = await file.arrayBuffer();
      return getBridge().upload.perform({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        bytes,
        size: file.size,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: uploadsQueryKey() });
    },
  });
}
