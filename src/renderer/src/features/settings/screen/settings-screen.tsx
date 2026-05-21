import { Button, Toggle, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { ChevronLeft, HardDrive, LogOut } from '@icons';
import { usePanelView } from '@shared/providers/panel-view-provider.tsx';
import { Logo } from '@shared/ui/logo/logo.tsx';

import { useAuth } from '../../auth/providers/auth-provider.tsx';
import { useLogout } from '../../auth/api/use-logout.ts';
import { useByokStatus } from '../api/use-byok-status.ts';
import { useClearByok, useSetByokEnabled } from '../api/use-save-byok.ts';
import { ByokForm } from '../parts/byok-form.tsx';

// Settings opens as an in-panel view. Account (sign in/out) + BYOK (connect a
// bucket, toggle "use my bucket" on/off, disconnect). All UI from the lib.
export function SettingsScreen() {
  const { openPanel } = usePanelView();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const byok = useByokStatus();
  const setEnabled = useSetByokEnabled();
  const clearByok = useClearByok();

  const status = byok.data;

  return (
    <div className="flex h-screen flex-col bg-[var(--fs-bg)]">
      <header className="flex items-center gap-2 border-b border-[var(--fs-border)] px-4 py-3">
        <button
          type="button"
          onClick={openPanel}
          aria-label="Back to panel"
          className="rounded-md p-1 text-[var(--fs-text-secondary)] hover:bg-[var(--fs-surface-hover)] hover:text-[var(--fs-text)]"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <Logo />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Account */}
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fs-text-tertiary)]">
            Account
          </h2>
          <Show
            when={isAuthenticated}
            fallback={
              <p className="text-sm text-[var(--fs-text-secondary)]">
                You&apos;re using your own storage without an account. Sign in from the welcome
                screen to enable hosted uploads.
              </p>
            }
          >
            <div className="flex items-center justify-between rounded-lg bg-[var(--fs-surface)] px-3 py-2.5">
              <span className="truncate text-sm text-[var(--fs-text)]">{user?.email}</span>
              <Button
                variant="quiet"
                size="sm"
                leadingIcon={<LogOut size={14} />}
                loading={logout.isPending}
                onClick={() =>
                  logout.mutate(undefined, { onSuccess: () => toast.success('Signed out') })
                }
              >
                Sign out
              </Button>
            </div>
          </Show>
        </section>

        {/* BYOK */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--fs-text-tertiary)]">
            <HardDrive size={12} aria-hidden="true" />
            Your storage
          </h2>

          <Show
            when={Boolean(status?.configured)}
            fallback={<ByokForm submitLabel="Save & use my bucket" />}
          >
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-[var(--fs-surface)] px-3 py-2.5 text-sm">
                <p className="font-medium text-[var(--fs-text)]">
                  {status?.provider?.toUpperCase()} · {status?.bucket}
                </p>
                <p className="text-xs text-[var(--fs-text-tertiary)]">
                  Keys stored securely on this device
                </p>
              </div>

              <Toggle
                checked={Boolean(status?.enabled)}
                label="Use my bucket for uploads"
                onChange={(checked) =>
                  setEnabled.mutate(checked, {
                    onSuccess: () =>
                      toast.success(checked ? 'Using your bucket' : 'Using hosted storage'),
                  })
                }
              />

              <Button
                variant="danger"
                size="sm"
                loading={clearByok.isPending}
                onClick={() =>
                  clearByok.mutate(undefined, {
                    onSuccess: () => toast.success('Storage disconnected'),
                  })
                }
              >
                Disconnect storage
              </Button>
            </div>
          </Show>
        </section>
      </div>
    </div>
  );
}
