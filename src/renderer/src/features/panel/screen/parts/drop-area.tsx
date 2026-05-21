import { CopyableLink, DropZone, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { AlertCircle, Loader2, Salad, UploadCloud } from '@icons';

import { usePasteUpload } from '../../utils/use-paste-upload.ts';
import { useUploadController } from '../../utils/use-upload-controller.ts';

// The centered white circle with the pulsing halo, matching the web tone but
// panel-scaled. Drop/click come from the lib DropZone; ⌘V paste is wired
// globally. Success shows a CopyableLink (+ "Link copied" toast); quota/size
// errors render inline (with the BYO nudge), never as toasts.
export function DropArea() {
  const { state, upload, reset } = useUploadController();
  const isUploading = state.status === 'uploading';

  usePasteUpload(upload, !isUploading);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={`fs-target ${isUploading ? 'is-busy' : ''}`}>
        <DropZone
          onFiles={(files) => {
            const file = files[0];
            if (file) upload(file);
          }}
          disabled={isUploading}
          aria-label="Drop, paste, or click to upload a file"
          className="fs-dropzone-circle"
        >
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Show
              when={!isUploading}
              fallback={<Loader2 className="animate-spin text-[var(--fs-accent)]" size={36} />}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fs-accent-subtle)]">
                <Salad className="text-[var(--fs-accent)]" size={32} aria-hidden="true" />
              </span>
            </Show>
            <span className="text-sm font-medium text-[var(--fs-text)]">
              {isUploading ? 'Uploading…' : 'Drop, paste, or click'}
            </span>
            <Show when={!isUploading}>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--fs-text-secondary)]">
                <UploadCloud size={11} aria-hidden="true" /> one file, any type
              </span>
            </Show>
          </div>
        </DropZone>
      </div>

      <Show when={state.status === 'success'}>
        <div className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-bg)] p-3 shadow-sm">
          <p className="mb-2 text-center text-xs font-medium text-[var(--fs-text-secondary)]">
            Your link is ready
          </p>
          {state.status === 'success' && (
            <CopyableLink url={state.result.publicUrl} onCopy={() => toast.success('Link copied')} />
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-2 w-full text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
          >
            Send another file
          </button>
        </div>
      </Show>

      <Show when={state.status === 'error'}>
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-[var(--fs-error-bg)] px-3 py-2 text-xs text-[var(--fs-error)]"
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {state.status === 'error' ? state.message : null}
        </p>
      </Show>
    </div>
  );
}
