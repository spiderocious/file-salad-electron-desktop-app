// IPC channel contract shared between the main process and the preload bridge.
// One source of truth for channel names so a typo can't silently break a bridge.
export const IPC = {
  PANEL_HIDE: 'panel:hide',
  APP_VERSION: 'app:version',

  // Auth token store (secrets live in main, encrypted at rest).
  AUTH_GET_TOKENS: 'auth:get-tokens',
  AUTH_SET_TOKENS: 'auth:set-tokens',
  AUTH_CLEAR_TOKENS: 'auth:clear-tokens',

  // BYOK settings. The secret key is write-only across this boundary — reads
  // return status (configured/enabled + non-secret fields), never the secret.
  BYOK_GET_STATUS: 'byok:get-status',
  BYOK_SAVE: 'byok:save',
  BYOK_SET_ENABLED: 'byok:set-enabled',
  BYOK_CLEAR: 'byok:clear',

  // Provider config (today bundled in main; later proxied from the backend).
  PROVIDER_CONFIG_GET: 'provider-config:get',

  // Upload adapter ops — main selects hosted vs BYOK and performs the transfer.
  UPLOAD_PERFORM: 'upload:perform',
  UPLOAD_LIST: 'upload:list',
  UPLOAD_ACTIVE_MODE: 'upload:active-mode',
  // Refresh a stale presigned URL for an upload (hosted → download endpoint).
  UPLOAD_REFRESH_URL: 'upload:refresh-url',
  // Clear local/session upload history (on logout — no cross-account leak).
  UPLOAD_CLEAR_SESSION: 'upload:clear-session',

  // Share codes (hosted uploads only — BYOK never reaches our backend).
  SHARE_CREATE: 'share:create',
  SHARE_REDEEM: 'share:redeem',

  // History opt-in preference (persisted; off by default).
  HISTORY_GET_ENABLED: 'history:get-enabled',
  HISTORY_SET_ENABLED: 'history:set-enabled',

  // Open a URL in the system browser (privacy policy, share links, "Open").
  OPEN_EXTERNAL: 'app:open-external',
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];
