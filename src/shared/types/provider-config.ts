import type { StorageProvider } from './storage.ts';

// A descriptor of what a BYOK provider needs and how to derive its endpoint /
// public URL. The UI renders its credential form purely from this descriptor,
// and the main process derives endpoints from it — so neither hardcodes
// provider knowledge.
//
// IMPORTANT: this shape is intentionally serializable (no functions). Endpoint
// and public-URL derivation use string templates with `{field}` placeholders,
// not JS functions, so the whole config can later be served by the backend as
// JSON without any client change. See provider-config.ts (main) for the
// current bundled values and resolveTemplate() for interpolation.

// A single credential field the UI should collect for a provider.
export interface ProviderField {
  readonly key: string;
  readonly label: string;
  readonly placeholder?: string;
  // `password` masks input + marks it write-only (never read back to renderer).
  readonly type: 'text' | 'password';
  readonly required: boolean;
}

export interface ProviderDescriptor {
  readonly provider: StorageProvider;
  readonly label: string;
  // Fields to collect, in display order.
  readonly fields: readonly ProviderField[];
  // Default region; '' means collect it as a field instead.
  readonly defaultRegion: string;
  // Templates interpolated with the entered field values, e.g.
  //   "https://{accountId}.r2.cloudflarestorage.com"
  // Always shown to the user prefilled but editable.
  readonly endpointTemplate: string;
  readonly publicBaseTemplate: string;
}

// The full config the UI consumes. A versioned envelope so a backend-served
// version can be cache-busted/validated later.
export interface ProviderConfig {
  readonly version: number;
  readonly providers: readonly ProviderDescriptor[];
}
