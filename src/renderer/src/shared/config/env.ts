// Centralised env access for the renderer. The desktop app talks to our backend
// for auth + hosted uploads; BYOK uploads bypass the backend entirely (handled
// in main). Read import.meta.env here and nowhere else.
const DEFAULT_API_BASE_URL = 'http://localhost:8096';

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
} as const;
