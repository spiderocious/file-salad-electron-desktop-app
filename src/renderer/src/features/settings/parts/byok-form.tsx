import { Button, FieldLabel, SegmentControl, TextInput, toast } from 'file-salad-ui-lib';
import { Repeat, Show } from 'meemaw';
import { useMemo, useState } from 'react';

import { Loader2 } from '@icons';
import { useProviderConfig } from '@shared/api/use-provider-config.ts';
import type {
  ByokCredentials,
  StorageProvider,
} from '../../../../../shared/types/storage.ts';
import type { ProviderDescriptor } from '../../../../../shared/types/provider-config.ts';

import { useSaveByok } from '../api/use-save-byok.ts';

interface ByokFormProps {
  // Called after a successful save (e.g. enter the panel, or close settings).
  readonly onSaved?: () => void;
  readonly submitLabel?: string;
}

// Renders the BYOK credential form entirely from the provider config — no
// hardcoded provider knowledge. Each provider declares its own fields; the
// endpoint + public URL are derived but shown as editable overrides. When the
// config later comes from the backend, this component is unchanged.
export function ByokForm({ onSaved, submitLabel = 'Save & use my bucket' }: ByokFormProps) {
  const config = useProviderConfig();
  const save = useSaveByok();

  const providers = config.data?.providers ?? [];
  const [provider, setProvider] = useState<StorageProvider | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [endpoint, setEndpoint] = useState('');
  const [publicBase, setPublicBase] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Default to the first provider once config loads.
  const activeProvider = provider ?? providers[0]?.provider ?? null;
  const descriptor: ProviderDescriptor | undefined = useMemo(
    () => providers.find((p) => p.provider === activeProvider),
    [providers, activeProvider],
  );

  function setField(key: string, value: string): void {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(): void {
    if (!descriptor) return;
    const missing = descriptor.fields.find((f) => f.required && !values[f.key]?.trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setError(null);

    const creds: ByokCredentials = {
      provider: descriptor.provider,
      bucket: values.bucket ?? '',
      accessKeyId: values.accessKeyId ?? '',
      secretKey: values.secretKey ?? '',
      region: values.region?.trim() || descriptor.defaultRegion,
      ...(values.accountId ? { accountId: values.accountId } : {}),
      ...(endpoint.trim() ? { endpoint: endpoint.trim() } : {}),
      ...(publicBase.trim() ? { publicBase: publicBase.trim() } : {}),
    };

    save.mutate(creds, {
      onSuccess: () => {
        toast.success('Storage connected');
        onSaved?.();
      },
      onError: () => setError('Could not save your storage settings.'),
    });
  }

  return (
    <Show
      when={!config.isLoading && Boolean(descriptor)}
      fallback={<Loader2 className="mx-auto animate-spin text-[var(--fs-accent)]" size={20} />}
    >
      <div className="flex flex-col gap-3">
        <div>
          <FieldLabel>Storage provider</FieldLabel>
          <SegmentControl
            aria-label="Storage provider"
            value={activeProvider ?? undefined}
            options={providers.map((p) => ({ value: p.provider, label: p.label }))}
            onChange={(value) => {
              setProvider(value as StorageProvider);
              setValues({});
              setEndpoint('');
              setPublicBase('');
              setError(null);
            }}
          />
        </div>

        <Show when={Boolean(descriptor)}>
          <Repeat each={descriptor ? [...descriptor.fields] : []}>
            {(field) => (
              <div key={field.key}>
                <FieldLabel required={field.required}>{field.label}</FieldLabel>
                <TextInput
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ''}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              </div>
            )}
          </Repeat>
        </Show>

        <div>
          <FieldLabel hint="Prefilled from the provider — edit only if yours differs">
            Endpoint (optional)
          </FieldLabel>
          <TextInput
            placeholder={descriptor?.endpointTemplate}
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>

        <div>
          <FieldLabel hint="Where uploaded files are publicly served from">
            Public URL base (optional)
          </FieldLabel>
          <TextInput
            placeholder={descriptor?.publicBaseTemplate || 'https://cdn.example.com'}
            value={publicBase}
            onChange={(e) => setPublicBase(e.target.value)}
          />
        </div>

        <Show when={Boolean(error)}>
          <p role="alert" className="text-sm text-[var(--fs-error)]">
            {error}
          </p>
        </Show>

        <Button onClick={handleSubmit} loading={save.isPending}>
          {submitLabel}
        </Button>
      </div>
    </Show>
  );
}
