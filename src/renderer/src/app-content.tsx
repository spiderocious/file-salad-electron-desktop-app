import { AuthGuard } from '@features/auth/guards/auth-guard.tsx';
import { PanelScreen } from '@features/panel/screen/panel-screen.tsx';

// The app is one canvas (the upload panel) with everything else layered over it
// as drawers (auth, settings, history). The AuthGuard renders nothing of its
// own — it just opens the non-dismissable auth drawer when the user isn't
// allowed in yet, over the blurred canvas.
export function AppContent() {
  return (
    <>
      <PanelScreen />
      <AuthGuard />
    </>
  );
}
