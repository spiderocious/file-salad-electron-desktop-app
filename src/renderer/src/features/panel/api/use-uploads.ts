import { useQuery } from '@tanstack/react-query';

import type { UploadListItem } from '../../../../../shared/types/upload.ts';

export const uploadsQueryKey = () => ['uploads'] as const;

// Upload history through the active adapter. Hosted history comes from our
// backend; BYOK history is local to main — the renderer renders both the same.
export function useUploads() {
  return useQuery<UploadListItem[]>({
    queryKey: uploadsQueryKey(),
    queryFn: () => window.fileSalad.upload.list(),
    staleTime: 10_000,
  });
}
