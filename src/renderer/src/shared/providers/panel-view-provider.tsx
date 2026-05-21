import { createContext, useContext, useState, type ReactNode } from 'react';

// Which view fills the panel. Settings opens "in place" (same window) rather
// than a separate window — clicking the gear swaps the panel content to
// settings and back. State-routed (not URL-routed) since the panel is a single
// fixed surface.
export type PanelView = 'panel' | 'settings';

interface PanelViewContextValue {
  readonly view: PanelView;
  readonly openSettings: () => void;
  readonly openPanel: () => void;
}

const PanelViewContext = createContext<PanelViewContextValue | null>(null);

export function PanelViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<PanelView>('panel');
  return (
    <PanelViewContext.Provider
      value={{ view, openSettings: () => setView('settings'), openPanel: () => setView('panel') }}
    >
      {children}
    </PanelViewContext.Provider>
  );
}

export function usePanelView(): PanelViewContextValue {
  const ctx = useContext(PanelViewContext);
  if (!ctx) throw new Error('usePanelView must be used within PanelViewProvider');
  return ctx;
}
