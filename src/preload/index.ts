import { contextBridge, ipcRenderer } from 'electron';

import { IPC } from '@shared/ipc.ts';
import type { FileSaladBridge } from '@shared/bridge.ts';
import type { ByokCredentials, StoredTokens } from '@shared/types/storage.ts';
import type { UploadRequest } from '@shared/types/upload.ts';

// Minimal, explicit bridge. The renderer never touches `ipcRenderer` directly —
// it sees only `window.fileSalad`, a curated surface (contextIsolation on).
// Typed against FileSaladBridge so the implementation and the renderer-facing
// contract can't drift.
const api: FileSaladBridge = {
  hidePanel: () => ipcRenderer.send(IPC.PANEL_HIDE),
  getAppVersion: () => ipcRenderer.invoke(IPC.APP_VERSION),

  auth: {
    getTokens: () => ipcRenderer.invoke(IPC.AUTH_GET_TOKENS),
    setTokens: (tokens: StoredTokens) => ipcRenderer.invoke(IPC.AUTH_SET_TOKENS, tokens),
    clearTokens: () => ipcRenderer.invoke(IPC.AUTH_CLEAR_TOKENS),
  },

  byok: {
    getStatus: () => ipcRenderer.invoke(IPC.BYOK_GET_STATUS),
    save: (credentials: ByokCredentials) => ipcRenderer.invoke(IPC.BYOK_SAVE, credentials),
    setEnabled: (enabled: boolean) => ipcRenderer.invoke(IPC.BYOK_SET_ENABLED, enabled),
    clear: () => ipcRenderer.invoke(IPC.BYOK_CLEAR),
  },

  providerConfig: {
    get: () => ipcRenderer.invoke(IPC.PROVIDER_CONFIG_GET),
  },

  upload: {
    perform: (request: UploadRequest) => ipcRenderer.invoke(IPC.UPLOAD_PERFORM, request),
    list: () => ipcRenderer.invoke(IPC.UPLOAD_LIST),
    activeMode: () => ipcRenderer.invoke(IPC.UPLOAD_ACTIVE_MODE),
  },
};

contextBridge.exposeInMainWorld('fileSalad', api);
