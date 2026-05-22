import { Toggle } from 'file-salad-ui-lib';

import { PRIVACY_URL } from '@shared/config/env.ts';
import { getBridge } from '@shared/services/bridge.ts';

import { useHistoryEnabled, useSetHistoryEnabled } from '../../api/use-history-enabled.ts';

// Privacy control for history. History is opt-in (off by default) — this makes
// it explicit, with a link out to the full policy in the system browser.
export function HistorySettings() {
  const enabled = useHistoryEnabled();
  const setEnabled = useSetHistoryEnabled();

  return (
    <div className="rounded-lg bg-[var(--fs-surface)] p-3">
      <Toggle
        checked={Boolean(enabled.data)}
        label="Keep my links on this device"
        onChange={(checked) => setEnabled.mutate(checked)}
      />
      <p className="mt-1.5 text-xs text-[var(--fs-text-secondary)]">
        Stored only on this device.{' '}
        <button
          type="button"
          onClick={() => getBridge().openExternal(PRIVACY_URL)}
          className="font-medium text-[var(--fs-accent)] hover:underline"
        >
          Privacy
        </button>
      </p>
    </div>
  );
}
