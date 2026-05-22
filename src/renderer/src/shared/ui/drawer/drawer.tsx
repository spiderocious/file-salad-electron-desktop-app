import { X } from '@icons';
import { Show } from 'meemaw';
import { useEffect, type ReactNode } from 'react';

export interface DrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  // When false, backdrop-click and Esc do NOT close (e.g. required auth/BYOK).
  readonly dismissable?: boolean;
  // Drawer height as a CSS value: 'auto', '70%', '80vh', etc.
  readonly height?: string;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}

// A bottom-up drawer that slides over the canvas with a blurred/dimmed backdrop.
// Everything outside the upload screen renders through one of these, so the app
// reads as a single surface. Built on --fs-* tokens; respects reduced motion.
export function Drawer({
  open,
  onClose,
  dismissable = true,
  height = 'auto',
  title,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open || !dismissable) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissable, onClose]);

  return (
    <Show when={open}>
      <div className="fs-drawer-root" role="dialog" aria-modal="true">
        <button
          type="button"
          aria-label="Close"
          tabIndex={dismissable ? 0 : -1}
          className="fs-drawer-backdrop"
          onClick={() => {
            if (dismissable) onClose();
          }}
        />
        <div className="fs-drawer-sheet" style={{ height }}>
          <div className="fs-drawer-grip" aria-hidden="true" />
          <Show when={Boolean(title) || dismissable}>
            <div className="flex items-center justify-between px-5 pb-2 pt-1">
              <div className="text-sm font-semibold text-[var(--fs-text)]">{title}</div>
              <Show when={dismissable}>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-1 text-[var(--fs-text-secondary)] hover:bg-[var(--fs-surface-hover)] hover:text-[var(--fs-text)]"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </Show>
            </div>
          </Show>
          <div className="fs-drawer-body">{children}</div>
        </div>
      </div>
    </Show>
  );
}
