import { Skeleton, UploadHistoryItem, toast } from 'file-salad-ui-lib';
import { Repeat, Show } from 'meemaw';

import { Clock } from '@icons';

import { useUploads } from '../../api/use-uploads.ts';

// Upload history from the active adapter (hosted backend or local BYOK). Renders
// both identically — the renderer doesn't distinguish source. meemaw Show /
// Repeat instead of `&&` / `.map()` per project conventions.
export function HistoryList() {
  const uploads = useUploads();
  const entries = uploads.data ?? [];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--fs-text-tertiary)]">
        <Clock size={12} aria-hidden="true" />
        Recent
      </h2>

      <Show
        when={!uploads.isLoading}
        fallback={
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <Show
          when={entries.length > 0}
          fallback={
            <p className="py-6 text-center text-sm text-[var(--fs-text-tertiary)]">
              No uploads yet.
            </p>
          }
        >
          <ul className="flex flex-col gap-1">
            <Repeat each={[...entries]}>
              {(entry) => (
                <li key={entry.id}>
                  <UploadHistoryItem
                    filename={entry.filename}
                    url={entry.url}
                    size={entry.size}
                    timestamp={entry.timestamp}
                    // Lib's UploadMode is 'hosted' | 'byo'; ours is 'hosted' | 'byok'.
                    mode={entry.mode === 'byok' ? 'byo' : 'hosted'}
                    onCopy={() => toast.success('Link copied')}
                  />
                </li>
              )}
            </Repeat>
          </ul>
        </Show>
      </Show>
    </section>
  );
}
