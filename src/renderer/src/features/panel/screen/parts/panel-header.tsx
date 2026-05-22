import { Show } from 'meemaw';

import { Cloud, HardDrive, Settings, UploadCloud } from '@icons';
import { useDrawer } from '@shared/ui/drawer/drawer-host.tsx';
import { Logo } from '@shared/ui/logo/logo.tsx';

import { useAuth } from '../../../auth/providers/auth-provider.tsx';
import { AuthFlow } from '../../../auth/screen/auth-flow.tsx';
import { SettingsScreen } from '../../../settings/screen/settings-screen.tsx';
import { useActiveMode } from '../../api/use-active-mode.ts';
import { useUploadCount } from '../../providers/upload-count-provider.tsx';

// Top bar over the gradient canvas: settings gear + session upload counter on
// the LEFT (per the sketch), brand wordmark, and the active-storage badge on the
// right. Settings opens as a drawer.
export function PanelHeader() {
  const drawer = useDrawer();
  const { isAuthenticated } = useAuth();
  const { count } = useUploadCount();
  const mode = useActiveMode();
  const isByok = mode.data?.mode === 'byok';

  function openSettings(): void {
    drawer.open(
      <SettingsScreen
        onSignIn={() =>
          drawer.open(<AuthFlow onComplete={() => drawer.close()} />, {
            title: isAuthenticated ? 'Account' : 'Sign in to FileSalad',
          })
        }
      />,
      { title: 'Settings' },
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openSettings}
          aria-label="Settings"
          className="rounded-full bg-white/85 p-1.5 text-[var(--fs-text)] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Settings size={16} aria-hidden="true" />
        </button>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-[var(--fs-text)] shadow-sm"
          title="Files uploaded this session"
        >
          <UploadCloud size={12} aria-hidden="true" />
          {count}
        </span>
      </div>

      <Logo tone="inverse" />

      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm"
        style={{
          background: isByok ? 'var(--fs-accent-subtle)' : 'rgba(255,255,255,0.85)',
          color: isByok ? 'var(--fs-accent-active)' : 'var(--fs-text-secondary)',
        }}
        title={isByok ? 'Uploading to your own bucket' : 'Uploading to hosted storage'}
      >
        <Show when={isByok} fallback={<Cloud size={12} aria-hidden="true" />}>
          <HardDrive size={12} aria-hidden="true" />
        </Show>
        {isByok ? 'Your bucket' : 'Hosted'}
      </span>
    </header>
  );
}
