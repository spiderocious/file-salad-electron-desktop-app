import { Clock } from '@icons';

import { useDrawer } from '@shared/ui/drawer/drawer-host.tsx';

import { useUploads } from '../../api/use-uploads.ts';
import { HistoryList } from './history-list.tsx';

// A fixed strip docked to the bottom of the canvas. Tapping it raises the
// history drawer (the full list). Same pattern the web uses for mobile history.
export function HistoryBar() {
  const drawer = useDrawer();
  const uploads = useUploads();
  const count = uploads.data?.length ?? 0;

  return (
    <button
      type="button"
      onClick={() => drawer.open(<HistoryList />, { title: 'History', height: '72%' })}
      className="flex w-full items-center justify-center gap-1.5 border-t border-white/30 bg-white/85 py-2.5 text-sm font-medium text-[var(--fs-text)] backdrop-blur transition hover:bg-white"
    >
      <Clock size={14} aria-hidden="true" />
      History ({count})
    </button>
  );
}
