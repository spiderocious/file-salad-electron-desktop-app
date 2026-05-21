import { useCallback, useState } from 'react';

import { ApiError } from '@shared/services/api-error.ts';

import { useUploadFile } from '../api/use-upload-file.ts';
import { useUploadCount } from '../providers/upload-count-provider.tsx';
import type { UploadResult } from '../../../../../shared/types/upload.ts';

// Discriminated upload state for the drop area, plus the session count bump on
// success. Quota / size errors map to inline messages (with the BYO nudge on
// quota, per the PRD).
export type UploadState =
  | { readonly status: 'idle' }
  | { readonly status: 'uploading'; readonly filename: string }
  | { readonly status: 'success'; readonly result: UploadResult }
  | { readonly status: 'error'; readonly message: string };

function messageForError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'quota_exceeded':
        return "You've hit this month's hosted limit. Connect your own bucket in settings for unlimited uploads.";
      case 'file_too_large':
        return 'That file is over the hosted size limit.';
      case 'validation_error':
        return error.message || "That file couldn't be accepted.";
      case 'storage_unavailable':
        return 'Upload failed — storage is unavailable. Please try again.';
      default:
        return error.message || 'Something went wrong. Please try again.';
    }
  }
  // BYOK errors come back as plain Errors (signed/PUT failures from main).
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

interface UploadController {
  readonly state: UploadState;
  readonly upload: (file: File) => void;
  readonly reset: () => void;
}

export function useUploadController(): UploadController {
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const mutation = useUploadFile();
  const { increment } = useUploadCount();

  const upload = useCallback(
    (file: File) => {
      setState({ status: 'uploading', filename: file.name });
      mutation.mutate(file, {
        onSuccess: (result) => {
          increment();
          setState({ status: 'success', result });
        },
        onError: (error) => setState({ status: 'error', message: messageForError(error) }),
      });
    },
    [mutation, increment],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, upload, reset };
}
