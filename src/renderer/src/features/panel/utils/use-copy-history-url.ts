import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { copyToClipboard } from 'file-salad-ui-lib';

import { isUrlExpired } from '@shared/utils/url-expiry.ts';

import { useRefreshUrl } from '../api/use-refresh-url.ts';
import { uploadsQueryKey } from '../api/use-uploads.ts';
import type { UploadListItem } from '../../../../../shared/types/upload.ts';

export type CopyStatus = 'idle' | 'loading' | 'copied' | 'error';

interface CopyController {
  readonly status: CopyStatus;
  readonly errorMessage: string | null;
  readonly copy: (entry: UploadListItem) => void;
}

const COPIED_RESET_MS = 1600;

// Expiry-aware copy (docs/url-expiry.md): copy the cached URL if still valid;
// otherwise refetch a fresh one from main (loading state), patch it back into
// the uploads query cache, and copy that. A failure → row error. One per row.
export function useCopyHistoryUrl(): CopyController {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const refresh = useRefreshUrl();
  const queryClient = useQueryClient();

  const finishCopied = useCallback(async (url: string) => {
    const ok = await copyToClipboard(url);
    if (!ok) {
      setStatus('error');
      setErrorMessage('Could not copy to clipboard.');
      return;
    }
    setStatus('copied');
    window.setTimeout(() => setStatus('idle'), COPIED_RESET_MS);
  }, []);

  const copy = useCallback(
    (entry: UploadListItem) => {
      setErrorMessage(null);

      if (!isUrlExpired(entry.cachedExpiresAt)) {
        setStatus('loading');
        void finishCopied(entry.cachedUrl);
        return;
      }

      setStatus('loading');
      refresh.mutate(entry.id, {
        onSuccess: (fresh) => {
          // Patch the fresh URL + expiry into the cached uploads list.
          queryClient.setQueryData<UploadListItem[]>(uploadsQueryKey(), (prev) =>
            (prev ?? []).map((u) =>
              u.id === entry.id ? { ...u, cachedUrl: fresh.url, cachedExpiresAt: fresh.expiresAt } : u,
            ),
          );
          void finishCopied(fresh.url);
        },
        onError: () => {
          setStatus('error');
          setErrorMessage('This file has expired or is unavailable.');
        },
      });
    },
    [finishCopied, refresh, queryClient],
  );

  return { status, errorMessage, copy };
}
