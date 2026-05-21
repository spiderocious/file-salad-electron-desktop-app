import { describe, expect, it } from 'vitest';

import { PROVIDER_CONFIG, findDescriptor, resolveTemplate } from '../provider-config.ts';
import type { ByokCredentials } from '../types/storage.ts';

function creds(over: Partial<ByokCredentials>): ByokCredentials {
  return {
    provider: 's3',
    bucket: 'my-bucket',
    accessKeyId: 'AK',
    secretKey: 'SK',
    region: 'us-east-1',
    ...over,
  };
}

describe('provider-config', () => {
  it('ships the four providers the UI offers', () => {
    expect(PROVIDER_CONFIG.providers.map((p) => p.provider).sort()).toEqual([
      'gcs',
      'r2',
      's3',
      't3',
    ]);
  });

  it('interpolates the S3 endpoint template from region', () => {
    const s3 = findDescriptor(PROVIDER_CONFIG, 's3');
    expect(s3).not.toBeNull();
    expect(resolveTemplate(s3!.endpointTemplate, creds({ region: 'eu-west-1' }))).toBe(
      'https://s3.eu-west-1.amazonaws.com',
    );
  });

  it('interpolates the R2 endpoint template from accountId', () => {
    const r2 = findDescriptor(PROVIDER_CONFIG, 'r2');
    expect(resolveTemplate(r2!.endpointTemplate, creds({ provider: 'r2', accountId: 'acc123' }))).toBe(
      'https://acc123.r2.cloudflarestorage.com',
    );
  });

  it('declares accountId as a required field only for R2', () => {
    const r2 = findDescriptor(PROVIDER_CONFIG, 'r2');
    const s3 = findDescriptor(PROVIDER_CONFIG, 's3');
    expect(r2!.fields.some((f) => f.key === 'accountId')).toBe(true);
    expect(s3!.fields.some((f) => f.key === 'accountId')).toBe(false);
  });

  it('leaves an unmatched placeholder empty rather than printing it', () => {
    const r2 = findDescriptor(PROVIDER_CONFIG, 'r2');
    // No accountId supplied → the {accountId} slot resolves to ''.
    expect(resolveTemplate(r2!.endpointTemplate, creds({ provider: 'r2' }))).toBe(
      'https://.r2.cloudflarestorage.com',
    );
  });
});
