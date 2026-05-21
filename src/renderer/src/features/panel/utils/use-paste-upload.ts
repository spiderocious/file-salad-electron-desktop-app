import { useEffect } from 'react';

// ⌘V paste-to-upload inside the panel: hands the first pasted file to the
// caller, ignoring text-only pastes.
export function usePasteUpload(onFile: (file: File) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return undefined;
    function onPaste(event: ClipboardEvent): void {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            onFile(file);
            return;
          }
        }
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onFile, enabled]);
}
