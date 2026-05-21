import { Show } from 'meemaw';

import { usePanelView } from '@shared/providers/panel-view-provider.tsx';

import { AuthGuard } from '@features/auth/guards/auth-guard.tsx';
import { PanelScreen } from '@features/panel/screen/panel-screen.tsx';
import { SettingsScreen } from '@features/settings/screen/settings-screen.tsx';

// The app shell behind the auth gate. Once allowed in (signed in OR BYOK on),
// the panel-view state decides whether the panel or settings fills the window.
export function AppContent() {
  return (
    <AuthGuard>
      <PanelOrSettings />
    </AuthGuard>
  );
}

function PanelOrSettings() {
  const { view } = usePanelView();
  return (
    <Show when={view === 'panel'} fallback={<SettingsScreen />}>
      <PanelScreen />
    </Show>
  );
}
