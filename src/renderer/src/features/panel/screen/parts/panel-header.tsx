import { Show } from 'meemaw';

import { Cloud, HardDrive, Settings, UploadCloud } from '@icons';
import { usePanelView } from '@shared/providers/panel-view-provider.tsx';
import { Logo } from '@shared/ui/logo/logo.tsx';

import { useActiveMode } from '../../api/use-active-mode.ts';
import { useUploadCount } from '../../providers/upload-count-provider.tsx';

// Top bar: brand, the session upload count, a badge showing which storage is
// active (hosted vs the user's own bucket), and the settings gear (opens the
// in-panel settings view).
export function PanelHeader() {
  const { openSettings } = usePanelView();
  const { count } = useUploadCount();
  const mode = useActiveMode();
  const isByok = mode.data?.mode === 'byok';

  return (
    <header className="flex items-center justify-between border-b border-[var(--fs-border)] px-4 py-3">
      <Logo />

      <div className="flex items-center gap-2">
        {/* Session upload count */}
        <span
          className="inline-flex items-center gap-1 rounded-full bg-[var(--fs-surface)] px-2 py-1 text-xs font-medium text-[var(--fs-text-secondary)]"
          title="Files uploaded this session"
        >
          <UploadCloud size={12} aria-hidden="true" />
          {count}
        </span>

        {/* Active storage badge */}
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
          style={{
            background: isByok ? 'var(--fs-accent-subtle)' : 'var(--fs-surface)',
            color: isByok ? 'var(--fs-accent-active)' : 'var(--fs-text-secondary)',
          }}
          title={isByok ? 'Uploading to your own bucket' : 'Uploading to hosted storage'}
        >
          <Show when={isByok} fallback={<Cloud size={12} aria-hidden="true" />}>
            <HardDrive size={12} aria-hidden="true" />
          </Show>
          {isByok ? 'Your bucket' : 'Hosted'}
        </span>

        <button
          type="button"
          onClick={openSettings}
          aria-label="Settings"
          className="rounded-md p-1 text-[var(--fs-text-secondary)] hover:bg-[var(--fs-surface-hover)] hover:text-[var(--fs-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]"
        >
          <Settings size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
