import { secureStore } from './secure-store.ts';
import type { ByokStatus } from '@shared/types/storage.ts';

// The non-secret view of BYOK config the renderer is allowed to see. The secret
// key is deliberately omitted — it never crosses back to the renderer.
export function byokStatus(): ByokStatus {
  const creds = secureStore.getByok();
  if (!creds) return { configured: false, enabled: false };
  // Conditional spread so optional fields are absent (not explicitly undefined)
  // under exactOptionalPropertyTypes.
  return {
    configured: true,
    enabled: secureStore.isByokEnabled(),
    provider: creds.provider,
    bucket: creds.bucket,
    region: creds.region,
    ...(creds.accountId !== undefined && { accountId: creds.accountId }),
    ...(creds.endpoint !== undefined && { endpoint: creds.endpoint }),
    ...(creds.publicBase !== undefined && { publicBase: creds.publicBase }),
  };
}
