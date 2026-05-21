// Single source of truth for backend paths (relative to {API_BASE_URL}/api/v1).
// The renderer hits auth + /me directly; hosted upload endpoints are called by
// the main process (hosted adapter), so they aren't listed here.
export const EP = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  ME: '/me',
} as const;
