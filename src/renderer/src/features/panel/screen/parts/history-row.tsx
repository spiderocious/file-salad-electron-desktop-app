import { formatBytes, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { AlertCircle, Check, Copy, LinkIcon, Loader2 } from '@icons';
import { getBridge } from '@shared/services/bridge.ts';

import { useCopyHistoryUrl } from '../../utils/use-copy-history-url.ts';
import type { UploadListItem } from '../../../../../../shared/types/upload.ts';
import { ShareButton } from './share-button.tsx';

interface HistoryRowProps {
  readonly entry: UploadListItem;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Our own history row (the lib's UploadHistoryItem can't expose the copy's
// loading/expiry step). Copy button animates Copy → spinner (refetch) → ✓ Copied;
// inline error if the file is gone. In-button confirmation is the primary
// feedback since the drawer hides the toast.
export function HistoryRow({ entry }: HistoryRowProps) {
  const { status, errorMessage, copy } = useCopyHistoryUrl();
  const meta = [formatBytes(entry.size), formatTime(entry.timestamp)].filter(Boolean).join(' · ');

  return (
    <div className="rounded-lg border border-[var(--fs-border)] bg-[var(--fs-bg)] px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--fs-text)]">{entry.filename}</p>
          <p className="flex items-center gap-1.5 text-xs text-[var(--fs-text-tertiary)]">
            {meta}
            <Show when={entry.mode === 'byok'}>
              <span className="rounded bg-[var(--fs-accent-subtle)] px-1 text-[10px] font-medium text-[var(--fs-accent-active)]">
                your bucket
              </span>
            </Show>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => getBridge().openExternal(entry.cachedUrl)}
            aria-label="Open link"
            className="rounded-full p-1.5 text-[var(--fs-text-secondary)] hover:bg-[var(--fs-surface-hover)] hover:text-[var(--fs-text)]"
          >
            <LinkIcon size={14} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              copy(entry);
              toast.success('Link copied');
            }}
            disabled={status === 'loading'}
            aria-label={status === 'copied' ? 'Copied' : 'Copy link'}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === 'copied'
                ? 'bg-[var(--fs-accent-subtle)] text-[var(--fs-accent-active)]'
                : 'bg-[var(--fs-surface)] text-[var(--fs-text)] hover:bg-[var(--fs-surface-hover)]'
            }`}
          >
            <Show
              when={status !== 'loading'}
              fallback={<Loader2 size={13} className="animate-spin" aria-hidden="true" />}
            >
              <Show when={status === 'copied'} fallback={<Copy size={13} aria-hidden="true" />}>
                <Check size={13} className="fs-copy-pop" aria-hidden="true" />
              </Show>
            </Show>
            {status === 'copied' ? 'Copied' : status === 'loading' ? 'Refreshing…' : 'Copy'}
          </button>
        </div>
      </div>

      <Show when={status === 'error' && Boolean(errorMessage)}>
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-[var(--fs-error)]">
          <AlertCircle size={13} aria-hidden="true" />
          {errorMessage}
        </p>
      </Show>

      {/* Share codes are hosted-only — BYOK uploads never reached our backend. */}
      <Show when={entry.mode === 'hosted'}>
        <div className="mt-2">
          <ShareButton uploadId={entry.id} />
        </div>
      </Show>
    </div>
  );
}
