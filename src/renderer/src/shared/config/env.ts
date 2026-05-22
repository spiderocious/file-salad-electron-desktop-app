// Centralised env access for the renderer. The desktop app talks to our backend
// for auth + hosted uploads (BYOK bypasses the backend, handled in main) and
// links out to the web app for the privacy policy + share links. Read
// import.meta.env here and nowhere else.
const DEFAULT_API_BASE_URL = 'http://localhost:8096';
const DEFAULT_WEB_BASE_URL = 'http://localhost:5173';

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  // The web app's origin — used for the /privacy link-out and `/s/CODE` share
  // links shown in the panel.
  WEB_BASE_URL: import.meta.env.VITE_WEB_BASE_URL ?? DEFAULT_WEB_BASE_URL,
} as const;

export function shareLink(code: string): string {
  return `${ENV.WEB_BASE_URL.replace(/\/$/, '')}/s/${code}`;
}

export const PRIVACY_URL = `${ENV.WEB_BASE_URL.replace(/\/$/, '')}/privacy`;
