import { DropZone } from 'file-salad-ui-lib';
import { Show } from 'meemaw';
import { useState } from 'react';

import { AlertCircle, Loader2, Salad, UploadCloud } from '@icons';
import { ModeTabs } from '@shared/ui/mode-tabs/mode-tabs.tsx';

import { usePasteUpload } from '../../utils/use-paste-upload.ts';
import { useUploadController } from '../../utils/use-upload-controller.ts';
import { CodeRedeem } from './code-redeem.tsx';
import { ResultPanel } from './result-panel.tsx';
import { ShareButton } from './share-button.tsx';

type Mode = 'upload' | 'code';

const MODE_OPTIONS = [
  { value: 'upload' as const, label: 'Upload' },
  { value: 'code' as const, label: 'Have a code' },
];

// The panel's drop card is dual-mode: Upload (drop / paste / click) or Code
// (redeem a share code). Tabs sit above the card; Upload is the default.
export function DropArea() {
  const [mode, setMode] = useState<Mode>('upload');

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ModeTabs<Mode>
        value={mode}
        options={MODE_OPTIONS}
        onChange={setMode}
        aria-label="Upload or redeem a code"
      />
      <Show when={mode === 'upload'} fallback={<CodeRedeemCard />}>
        <UploadCard />
      </Show>
    </div>
  );
}

function UploadCard() {
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
        {state.status === 'success' ? (
          <div className="flex w-full flex-col gap-2">
            <ResultPanel
              title="Your link is ready"
              url={state.result.publicUrl}
              resetLabel="Send another file"
              onReset={reset}
            />
            {/* Share codes are hosted-only — BYOK uploads never reached our backend. */}
            <Show when={state.result.mode === 'hosted'}>
              <ShareButton uploadId={state.result.uploadId} />
            </Show>
          </div>
        ) : null}
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

function CodeRedeemCard() {
  return (
    <div className="fs-target w-full">
      <div className="fs-dropzone-circle">
        <CodeRedeem />
      </div>
    </div>
  );
}
