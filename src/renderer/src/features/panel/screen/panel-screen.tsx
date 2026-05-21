import { ToastHost } from 'file-salad-ui-lib';

import { usePanelDismiss } from '../utils/use-panel-dismiss.ts';
import { DropArea } from './parts/drop-area.tsx';
import { HistoryList } from './parts/history-list.tsx';
import { PanelHeader } from './parts/panel-header.tsx';

// The authed panel. Reads like a table of contents: header (brand, count, mode
// badge, settings), the centered drop target, and recent uploads. Esc dismisses
// the whole panel. All visual surfaces come from the FileSalad UI library.
export function PanelScreen() {
  usePanelDismiss();

  return (
    <div className="flex h-screen flex-col bg-[var(--fs-bg)] text-[var(--fs-text)]">
      <PanelHeader />
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
        <DropArea />
        <HistoryList />
      </main>
      <ToastHost position="bottom" />
    </div>
  );
}
