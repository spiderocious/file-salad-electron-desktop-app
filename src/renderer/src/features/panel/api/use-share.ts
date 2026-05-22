import { useMutation } from '@tanstack/react-query';

import { getBridge } from '@shared/services/bridge.ts';
import type { RedeemedFile, ShareCode } from '../../../../../shared/types/upload.ts';

// Mint a share code for a hosted upload (BYOK uploads can't be shared — the
// backend never saw them; callers gate the action). Routed through main.
export function useShareCode() {
  return useMutation<ShareCode, Error, string>({
    mutationFn: (uploadId) => getBridge().share.create(uploadId),
  });
}

// Redeem a share code → the file's fresh download URL. Public; main calls the
// backend. 404/429 surface as a generic error for inline display.
export function useRedeemCode() {
  return useMutation<RedeemedFile, Error, string>({
    mutationFn: (code) => getBridge().share.redeem(code),
  });
}
