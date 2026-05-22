import { ToastHost } from 'file-salad-ui-lib';

import { usePanelDismiss } from '../utils/use-panel-dismiss.ts';
import { DropArea } from './parts/drop-area.tsx';
import { HistoryBar } from './parts/history-bar.tsx';
import { PanelHeader } from './parts/panel-header.tsx';

// The single canvas: the brand gradient with the top bar, the centered drop
// target, and the docked history bar. Everything else (auth, settings, history)
// opens as a drawer over this. Esc dismisses the panel window.
export function PanelScreen() {
  usePanelDismiss();

  return (
    <div className="fs-backdrop flex h-screen flex-col text-[var(--fs-text)]">
      <PanelHeader />
      <main className="flex flex-1 items-center justify-center px-5 pb-4">
        <div className="w-full max-w-xs">
          <DropArea />
        </div>
      </main>
      <HistoryBar />
      <ToastHost position="bottom" />
    </div>
  );
}
