import { useEffect } from 'react';

// Esc closes the drop-down panel — the menu-bar convention. The actual hide
// happens in the main process via the typed preload bridge.
export function usePanelDismiss(): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') window.fileSalad.hidePanel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
