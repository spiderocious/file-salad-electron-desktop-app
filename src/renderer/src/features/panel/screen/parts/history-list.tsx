import { Skeleton } from 'file-salad-ui-lib';
import { Repeat, Show } from 'meemaw';

import { useHistoryEnabled } from '../../api/use-history-enabled.ts';
import { useUploads } from '../../api/use-uploads.ts';
import { HistoryRow } from './history-row.tsx';
import { HistorySettings } from './history-settings.tsx';

// History drawer body. History is opt-in (off by default) — when off we show the
// privacy toggle + an explainer instead of the list. When on, rows come from the
// active adapter (hosted backend or local BYOK) via HistoryRow (expiry-aware
// copy). meemaw Show / Repeat, not `&&` / `.map()`.
export function HistoryList() {
  const historyEnabled = useHistoryEnabled();
  const enabled = Boolean(historyEnabled.data);
  const uploads = useUploads();
  const entries = enabled ? (uploads.data ?? []) : [];

  return (
    <div className="flex flex-col gap-3">
      <HistorySettings />

      <Show
        when={enabled}
        fallback={
          <p className="py-8 text-center text-sm text-[var(--fs-text-tertiary)]">
            History is off. Turn it on above to keep a list of your links on this device.
          </p>
        }
      >
        <Show
          when={!uploads.isLoading}
          fallback={
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          }
        >
          <Show
            when={entries.length > 0}
            fallback={
              <p className="py-8 text-center text-sm text-[var(--fs-text-tertiary)]">
                No uploads yet. Your links will show up here.
              </p>
            }
          >
            <ul className="flex flex-col gap-2">
              <Repeat each={[...entries]}>
                {(entry) => <HistoryRow key={entry.id} entry={entry} />}
              </Repeat>
            </ul>
          </Show>
        </Show>
      </Show>
    </div>
  );
}
