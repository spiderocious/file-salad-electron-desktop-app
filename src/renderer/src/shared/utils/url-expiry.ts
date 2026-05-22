// Per docs/url-expiry.md: every file URL is presigned and short-lived. We cache
// a URL + its absolute expiry and refetch when stale (with a skew margin).
export const EXPIRY_SKEW_MS = 60_000;

// True when there's no usable cached URL, or it's at/within the skew margin of
// expiry. A missing/invalid expiry counts as expired → forces a refetch.
export function isUrlExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  const expiryMs = Date.parse(expiresAt);
  if (Number.isNaN(expiryMs)) return true;
  return Date.now() >= expiryMs - EXPIRY_SKEW_MS;
}
