import { Button, Toggle, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { HardDrive, LogOut } from '@icons';
import { PRIVACY_URL } from '@shared/config/env.ts';
import { getBridge } from '@shared/services/bridge.ts';

import { useAuth } from '../../auth/providers/auth-provider.tsx';
import { useLogout } from '../../auth/api/use-logout.ts';
import { useByokStatus } from '../api/use-byok-status.ts';
import { useClearByok, useSetByokEnabled } from '../api/use-save-byok.ts';
import { ByokForm } from '../parts/byok-form.tsx';

interface SettingsScreenProps {
  // A BYOK-only (account-less) user can start the sign-in flow from here.
  readonly onSignIn: () => void;
}

// Settings as drawer content: account (sign in/out) + BYOK (connect a bucket,
// toggle "use my bucket", disconnect). All UI from the lib. The drawer chrome
// (title, close, scroll) is provided by the host.
export function SettingsScreen({ onSignIn }: SettingsScreenProps) {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const byok = useByokStatus();
  const setEnabled = useSetByokEnabled();
  const clearByok = useClearByok();

  const status = byok.data;

  return (
    <div className="flex flex-col pt-1">
      {/* Account */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fs-text-tertiary)]">
          Account
        </h2>
        <Show
          when={isAuthenticated}
          fallback={
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[var(--fs-text-secondary)]">
                You&apos;re using your own storage without an account.
              </p>
              <Button variant="secondary" size="sm" onClick={onSignIn}>
                Sign in or create account
              </Button>
            </div>
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

      {/* Privacy — links out to the web policy in the system browser. */}
      <section className="mt-6 border-t border-[var(--fs-border)] pt-4">
        <button
          type="button"
          onClick={() => getBridge().openExternal(PRIVACY_URL)}
          className="text-sm font-medium text-[var(--fs-accent)] hover:underline"
        >
          Privacy policy
        </button>
      </section>
    </div>
  );
}
