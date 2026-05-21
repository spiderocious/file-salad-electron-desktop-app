import { app, ipcMain } from 'electron';

import { IPC } from '@shared/ipc.ts';
import { PROVIDER_CONFIG } from '@shared/provider-config.ts';
import type { ByokCredentials, StoredTokens } from '@shared/types/storage.ts';
import type { UploadRequest } from '@shared/types/upload.ts';

import { activeMode, selectAdapter } from './adapters/select-adapter.ts';
import { byokStatus } from './services/byok-status.ts';
import { secureStore } from './services/secure-store.ts';

interface Handlers {
  onPanelHide: () => void;
}

// All IPC wiring in one place. Secrets stay in main: token reads return tokens
// (the renderer needs a Bearer header for /auth + /me), BYOK reads return only
// status (never the secret key), and upload signing/PUT happen here.
export function registerIpcHandlers({ onPanelHide }: Handlers): void {
  ipcMain.on(IPC.PANEL_HIDE, onPanelHide);
  ipcMain.handle(IPC.APP_VERSION, () => app.getVersion());

  // Auth tokens.
  ipcMain.handle(IPC.AUTH_GET_TOKENS, () => secureStore.getTokens());
  ipcMain.handle(IPC.AUTH_SET_TOKENS, (_e, tokens: StoredTokens) => secureStore.setTokens(tokens));
  ipcMain.handle(IPC.AUTH_CLEAR_TOKENS, () => secureStore.clearTokens());

  // BYOK settings.
  ipcMain.handle(IPC.BYOK_GET_STATUS, () => byokStatus());
  ipcMain.handle(IPC.BYOK_SAVE, (_e, creds: ByokCredentials) => {
    secureStore.saveByok(creds);
    return byokStatus();
  });
  ipcMain.handle(IPC.BYOK_SET_ENABLED, (_e, enabled: boolean) => {
    secureStore.setByokEnabled(enabled);
    return byokStatus();
  });
  ipcMain.handle(IPC.BYOK_CLEAR, () => {
    secureStore.clearByok();
    return byokStatus();
  });

  // Provider config — bundled today, swappable for a backend fetch later.
  ipcMain.handle(IPC.PROVIDER_CONFIG_GET, () => PROVIDER_CONFIG);

  // Upload adapter ops — the renderer never learns which adapter ran.
  ipcMain.handle(IPC.UPLOAD_PERFORM, (_e, request: UploadRequest) =>
    selectAdapter().perform(request),
  );
  ipcMain.handle(IPC.UPLOAD_LIST, () => selectAdapter().list());
  ipcMain.handle(IPC.UPLOAD_ACTIVE_MODE, () => ({ mode: activeMode() }));
}
