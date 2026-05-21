import { PROVIDER_CONFIG, findDescriptor, resolveTemplate } from '@shared/provider-config.ts';
import type { ByokCredentials } from '@shared/types/storage.ts';

// Resolve the request endpoint, region, and public-URL base for a BYOK upload
// from the (today bundled, later backend-served) provider config. User-supplied
// `endpoint` / `publicBase` overrides win — the config-derived value is only the
// default. Region falls back to the provider's default (e.g. "auto").
export interface ResolvedByokTarget {
  readonly host: string;
  readonly region: string;
  readonly publicBase: string;
}

export function resolveByokTarget(creds: ByokCredentials): ResolvedByokTarget {
  const descriptor = findDescriptor(PROVIDER_CONFIG, creds.provider);
  if (!descriptor) throw new Error(`Unknown storage provider: ${creds.provider}`);

  const endpoint = creds.endpoint?.trim()
    ? creds.endpoint.trim()
    : resolveTemplate(descriptor.endpointTemplate, creds);

  const region = creds.region?.trim() ? creds.region.trim() : descriptor.defaultRegion || 'auto';

  const publicBase = creds.publicBase?.trim()
    ? creds.publicBase.trim()
    : resolveTemplate(descriptor.publicBaseTemplate, creds);

  return { host: endpoint.replace(/^https?:\/\//, '').replace(/\/$/, ''), region, publicBase };
}

// Build the public (shareable) URL for an uploaded object key. If the provider
// has no derivable public base (e.g. R2 without a custom domain) and the user
// didn't supply one, fall back to endpoint/bucket/key — the user is then
// responsible for making the bucket public.
export function buildPublicUrl(creds: ByokCredentials, key: string): string {
  const { host, publicBase } = resolveByokTarget(creds);
  if (publicBase) return `${publicBase.replace(/\/$/, '')}/${key}`;
  return `https://${host}/${creds.bucket}/${key}`;
}
