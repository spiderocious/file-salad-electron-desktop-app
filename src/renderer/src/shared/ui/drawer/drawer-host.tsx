import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { Drawer } from './drawer.tsx';

interface OpenOptions {
  readonly title?: ReactNode;
  readonly dismissable?: boolean;
  readonly height?: string;
}

interface DrawerContextValue {
  readonly open: (content: ReactNode, options?: OpenOptions) => void;
  readonly close: () => void;
  readonly isOpen: boolean;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

interface DrawerState {
  readonly content: ReactNode;
  readonly options: OpenOptions;
}

// One drawer at a time, rendered over the canvas. Any feature opens a drawer via
// useDrawer().open(<Content />, { title, dismissable, height }) — so the upload
// screen stays the single canvas and everything else is an overlay.
export function DrawerHost({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState | null>(null);

  const open = useCallback((content: ReactNode, options: OpenOptions = {}) => {
    setState({ content, options });
  }, []);
  const close = useCallback(() => setState(null), []);

  const value = useMemo<DrawerContextValue>(
    () => ({ open, close, isOpen: state !== null }),
    [open, close, state],
  );

  return (
    <DrawerContext.Provider value={value}>
      {children}
      <Drawer
        open={state !== null}
        onClose={close}
        dismissable={state?.options.dismissable ?? true}
        {...(state?.options.height ? { height: state.options.height } : {})}
        {...(state?.options.title !== undefined ? { title: state.options.title } : {})}
      >
        {state?.content}
      </Drawer>
    </DrawerContext.Provider>
  );
}

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerHost');
  return ctx;
}
