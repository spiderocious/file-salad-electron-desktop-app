import type { ProviderConfig } from './types/provider-config.ts';
import type { ByokCredentials } from './types/storage.ts';

// Bundled BYOK provider config. This is the single source the UI renders from
// and main derives endpoints from. It is plain serializable JSON (string
// templates, no functions) so it can later be served by the backend verbatim —
// the renderer already consumes it through a hook (useProviderConfig), so
// swapping the source to a fetch changes nothing downstream.
//
// Field requirements per provider were verified against each provider's S3-API
// docs (R2 needs an account id for its endpoint; AWS S3 needs a real region;
// t3/r2/gcs use region "auto"; gcs HMAC keys sign with AWS4-HMAC-SHA256).
export const PROVIDER_CONFIG: ProviderConfig = {
  version: 1,
  providers: [
    {
      provider: 't3',
      label: 'Tigris',
      defaultRegion: 'auto',
      endpointTemplate: 'https://t3.storage.dev',
      publicBaseTemplate: 'https://{bucket}.t3.storage.dev',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Access Key', type: 'password', required: true },
      ],
    },
    {
      provider: 'r2',
      label: 'Cloudflare R2',
      defaultRegion: 'auto',
      endpointTemplate: 'https://{accountId}.r2.cloudflarestorage.com',
      // R2 public access needs a custom domain / r2.dev URL — user-provided.
      publicBaseTemplate: '',
      fields: [
        { key: 'accountId', label: 'Account ID', type: 'text', required: true },
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Access Key', type: 'password', required: true },
      ],
    },
    {
      provider: 's3',
      label: 'Amazon S3',
      defaultRegion: '',
      endpointTemplate: 'https://s3.{region}.amazonaws.com',
      publicBaseTemplate: 'https://{bucket}.s3.{region}.amazonaws.com',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'region', label: 'Region', placeholder: 'us-east-1', type: 'text', required: true },
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Access Key', type: 'password', required: true },
      ],
    },
    {
      provider: 'gcs',
      label: 'Google Cloud Storage',
      defaultRegion: 'auto',
      endpointTemplate: 'https://storage.googleapis.com',
      publicBaseTemplate: 'https://storage.googleapis.com/{bucket}',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'accessKeyId', label: 'Access Key ID (HMAC)', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret (HMAC)', type: 'password', required: true },
      ],
    },
  ],
};

// Interpolate "{field}" placeholders in a template against the entered
// credentials. Pure + serialization-safe (the alternative — JS functions in the
// config — couldn't be served as JSON by the backend later).
export function resolveTemplate(template: string, creds: ByokCredentials): string {
  const fields = creds as unknown as Record<string, unknown>;
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = fields[key];
    return typeof value === 'string' ? value : '';
  });
}

export function findDescriptor(config: ProviderConfig, provider: string) {
  return config.providers.find((p) => p.provider === provider) ?? null;
}
