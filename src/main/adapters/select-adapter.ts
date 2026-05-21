import type { UploadMode } from '@shared/types/upload.ts';

import { secureStore } from '../services/secure-store.ts';
import { ByokAdapter } from './byok-adapter.ts';
import { HostedAdapter } from './hosted-adapter.ts';
import type { UploadAdapter } from './upload-adapter.ts';

// The one rule that decides where bytes go: use the user's own bucket when they
// have saved credentials AND turned the "use my bucket" toggle on; otherwise
// use our hosted backend. An active user can flip this at any time (PRD D-5).
export function activeMode(): UploadMode {
  const creds = secureStore.getByok();
  return creds && secureStore.isByokEnabled() ? 'byok' : 'hosted';
}

export function selectAdapter(): UploadAdapter {
  const creds = secureStore.getByok();
  if (creds && secureStore.isByokEnabled()) return new ByokAdapter(creds);
  return new HostedAdapter();
}
